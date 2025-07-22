const fs = require('fs');
const path = require('path');

const MAX_LINES = 300;
const MAX_METHODS_PER_CLASS = 10;
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  'coverage',
  '.git',
  'tests/fixtures',
  '.test.ts',
  '.spec.ts',
];

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').filter(line => line.trim() !== '').length;
  } catch (error) {
    return 0;
  }
}

function analyzeTypeScriptFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Contar clases
    const classMatches = content.match(/class\s+\w+/g) || [];

    // Contar métodos por clase
    const methodMatches =
      content.match(/^\s*(private|public|protected)?\s*(static)?\s*\w+\s*\([^)]*\)\s*[:{]/gm) || [];

    // Contar funciones
    const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || [];

    return {
      classes: classMatches.length,
      methods: methodMatches.length,
      functions: functionMatches.length,
      totalResponsibilities: classMatches.length + functionMatches.length,
    };
  } catch (error) {
    return { classes: 0, methods: 0, functions: 0, totalResponsibilities: 0 };
  }
}

function getAllTsFiles(dir) {
  const files = [];
  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);

      if (shouldExcludeFile(fullPath)) continue;

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getAllTsFiles(fullPath));
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.js'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignorar errores de acceso a directorios
  }

  return files;
}

function checkCodeQuality() {
  console.log('🔍 Ejecutando verificación de calidad de código...\n');

  const violations = [];
  const filesToCheck = getAllTsFiles('.');

  console.log(`Verificando ${filesToCheck.length} archivos TypeScript/JavaScript...`);

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;

    const lineCount = countLines(file);
    const analysis = analyzeTypeScriptFile(file);

    // Verificar límite de líneas
    if (lineCount > MAX_LINES) {
      violations.push({
        file,
        type: 'LINE_LIMIT',
        message: `Archivo tiene ${lineCount} líneas (máximo: ${MAX_LINES})`,
        severity: 'error',
      });
    }

    // Verificar SRP - demasiadas responsabilidades
    if (analysis.totalResponsibilities > 3) {
      violations.push({
        file,
        type: 'SRP_VIOLATION',
        message: `Archivo tiene ${analysis.totalResponsibilities} responsabilidades (clases + funciones principales). Considera dividir en módulos más pequeños.`,
        severity: 'warning',
      });
    }

    // Verificar métodos por clase
    if (analysis.classes > 0 && analysis.methods > MAX_METHODS_PER_CLASS * analysis.classes) {
      violations.push({
        file,
        type: 'CLASS_COMPLEXITY',
        message: `Clases tienen demasiados métodos (${analysis.methods} total). Máximo recomendado: ${MAX_METHODS_PER_CLASS} por clase.`,
        severity: 'warning',
      });
    }

    // Mostrar estadísticas para archivos grandes
    if (lineCount > 200) {
      console.log(`📊 ${file}:`);
      console.log(`   Líneas: ${lineCount}`);
      console.log(`   Clases: ${analysis.classes}`);
      console.log(`   Métodos: ${analysis.methods}`);
      console.log(`   Funciones: ${analysis.functions}`);
      console.log('');
    }
  }

  // Mostrar violaciones
  if (violations.length > 0) {
    console.log('⚠️  Violaciones de calidad de código encontradas:\n');

    const errors = violations.filter(v => v.severity === 'error');
    const warnings = violations.filter(v => v.severity === 'warning');

    if (errors.length > 0) {
      console.log('❌ ERRORES (deben corregirse):');
      errors.forEach(violation => {
        console.log(`   ${violation.file}: ${violation.message}`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  ADVERTENCIAS (recomendado corregir):');
      warnings.forEach(violation => {
        console.log(`   ${violation.file}: ${violation.message}`);
      });
      console.log('');
    }

    // Sugerencias de refactoring
    console.log('💡 Sugerencias de refactoring:');
    console.log('   1. Dividir archivos grandes en módulos más pequeños');
    console.log('   2. Extraer clases/funciones a archivos separados');
    console.log('   3. Usar composición en lugar de herencia compleja');
    console.log('   4. Aplicar el patrón Strategy para reducir complejidad');
    console.log('');

    return violations;
  } else {
    console.log('✅ Todos los archivos cumplen con los estándares de calidad.');
    return [];
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkCodeQuality();
}

module.exports = { checkCodeQuality };
