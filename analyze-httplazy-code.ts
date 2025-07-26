/**
 * Análisis del código real de HTTPLazy con el Structural Analyzer
 */

import * as path from 'path';
import { DefaultStructuralAnalyzer } from './duplicate-detector/analyzers/structural-analyzer';
import { DEFAULT_CONFIG } from './duplicate-detector/config';
import { ASTParser } from './duplicate-detector/core/ast-parser';
import { FileDiscoveryEngine } from './duplicate-detector/core/file-discovery';

async function analyzeHttpLazyCode() {
  console.log('🔍 Analizando código real de HTTPLazy...\n');

  const analyzer = new DefaultStructuralAnalyzer();
  const astParser = new ASTParser();
  const fileDiscovery = new FileDiscoveryEngine();

  try {
    // Descubrir archivos TypeScript en el proyecto
    console.log('📁 Descubriendo archivos TypeScript...');
    const files = await fileDiscovery.discoverFiles('.', {
      ...DEFAULT_CONFIG,
      filters: {
        ...DEFAULT_CONFIG.filters,
        includePatterns: ['**/*.ts'],
        excludePatterns: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/tests/**',
          '**/examples/**',
          '**/analyze-*.ts'
        ]
      }
    });

    console.log(`   ✅ Encontrados ${files.length} archivos TypeScript\n`);

    // Parsear archivos y extraer clases
    console.log('🔧 Parseando archivos y extrayendo clases...');
    const allClasses: unknown[] = [];
    let parsedFiles = 0;

    for (const file of files.slice(0, 50)) { // Limitar a 50 archivos para no sobrecargar
      try {
        const ast = await astParser.parseFile(file);
        const metadata = astParser.extractMetadata(ast);

        if (metadata.classes.length > 0) {
          console.log(`   📄 ${path.basename(file)}: ${metadata.classes.length} clases`);
          allClasses.push(...metadata.classes);
        }
        parsedFiles++;
      } catch (error) {
        // Ignorar archivos que no se pueden parsear
        continue;
      }
    }

    console.log(`\n   ✅ Parseados ${parsedFiles} archivos, encontradas ${allClasses.length} clases\n`);

    if (allClasses.length === 0) {
      console.log('❌ No se encontraron clases para analizar');
      return;
    }

    // Análisis 1: Duplicación estructural
    console.log('🏗️  Análisis 1: Duplicación Estructural');
    console.log('=' .repeat(50));

    const structuralDuplicates = analyzer.detectStructuralDuplicates(allClasses);

    if (structuralDuplicates.length > 0) {
      console.log(`✅ Encontradas ${structuralDuplicates.length} duplicaciones estructurales:\n`);

      structuralDuplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Similitud: ${(dup.similarity.score * 100).toFixed(1)}%`);
        console.log(`   Clases: ${dup.instances.map(i => i.className).join(' ↔ ')}`);
        console.log(`   Sugerencia: ${dup.suggestion?.description}`);
        console.log(`   Beneficios: ${dup.suggestion?.benefits?.slice(0, 2).join(', ')}`);
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron duplicaciones estructurales significativas\n');
    }

    // Análisis 2: Patrones arquitectónicos
    console.log('🎯 Análisis 2: Patrones Arquitectónicos');
    console.log('=' .repeat(50));

    const architecturalPatterns = analyzer.detectArchitecturalPatterns(allClasses);

    if (architecturalPatterns.length > 0) {
      console.log(`✅ Encontrados ${architecturalPatterns.length} patrones arquitectónicos:\n`);

      architecturalPatterns.forEach((pattern, index) => {
        console.log(`${index + 1}. Patrón detectado`);
        console.log(`   Clases involucradas: ${pattern.instances.length}`);
        console.log(`   Clases: ${pattern.instances.map(i => i.className).join(', ')}`);
        console.log(`   Sugerencia: ${pattern.suggestion?.description}`);
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron patrones arquitectónicos duplicados\n');
    }

    // Análisis 3: Métodos duplicados entre clases
    console.log('🔄 Análisis 3: Métodos Duplicados Entre Clases');
    console.log('=' .repeat(50));

    const crossClassDuplicates = analyzer.detectCrossClassMethodDuplication(allClasses);

    if (crossClassDuplicates.length > 0) {
      console.log(`✅ Encontrados ${crossClassDuplicates.length} métodos duplicados:\n`);

      crossClassDuplicates.forEach((dup, index) => {
        console.log(`${index + 1}. Método: ${dup.instances[0].functionName}`);
        console.log(`   Clases: ${dup.instances.map(i => i.className).join(', ')}`);
        console.log(`   Sugerencia: ${dup.suggestion?.description}`);
        console.log('');
      });
    } else {
      console.log('✅ No se encontraron métodos duplicados entre clases\n');
    }

    // Resumen
    console.log('📊 Resumen del Análisis');
    console.log('=' .repeat(50));
    console.log(`📁 Archivos analizados: ${parsedFiles}`);
    console.log(`🏗️  Clases encontradas: ${allClasses.length}`);
    console.log(`🔍 Duplicaciones estructurales: ${structuralDuplicates.length}`);
    console.log(`🎯 Patrones arquitectónicos: ${architecturalPatterns.length}`);
    console.log(`🔄 Métodos duplicados: ${crossClassDuplicates.length}`);

    const totalIssues = structuralDuplicates.length + architecturalPatterns.length + crossClassDuplicates.length;
    console.log(`\n🎯 Total de oportunidades de refactorización: ${totalIssues}`);

    if (totalIssues > 0) {
      console.log('\n💡 Recomendaciones:');
      if (structuralDuplicates.length > 0) {
        console.log('   • Considera crear clases base o interfaces para las clases estructuralmente similares');
      }
      if (architecturalPatterns.length > 0) {
        console.log('   • Revisa los patrones arquitectónicos para posible consolidación');
      }
      if (crossClassDuplicates.length > 0) {
        console.log('   • Extrae métodos comunes a interfaces o utilidades compartidas');
      }
    } else {
      console.log('\n🎉 ¡Excelente! Tu código tiene una buena estructura sin duplicaciones significativas.');
    }

  } catch (error) {
    console.error('❌ Error durante el análisis:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

// Ejecutar el análisis
if (require.main === module) {
  analyzeHttpLazyCode().catch(console.error);
}

export { analyzeHttpLazyCode };
