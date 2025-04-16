#!/usr/bin/env node

/**
 * Script para generar un resumen consolidado de la biblioteca
 * Muestra estadísticas clave como tamaño, líneas de código, etc.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Colores para la salida
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Obtener información del package.json
const packageJson = require("../package.json");

console.log(
  `\n${colors.bright}${colors.cyan}📊 RESUMEN DE LA BIBLIOTECA - ${packageJson.name}@${packageJson.version}${colors.reset}\n`
);

// Líneas de código
try {
  const linesOutput = execSync(
    'find http -name "*.ts" | xargs wc -l'
  ).toString();
  const totalLines = parseInt(
    linesOutput.trim().split("\n").pop().trim().split(" ")[0]
  );
  const fileCount = execSync('find http -name "*.ts" | wc -l')
    .toString()
    .trim();

  console.log(`${colors.yellow}📝 Código fuente:${colors.reset}`);
  console.log(`  - Archivos TypeScript: ${fileCount}`);
  console.log(`  - Líneas de código: ${totalLines}`);
} catch (error) {
  console.log(
    `  ⚠️ No se pudo obtener información de líneas de código: ${error.message}`
  );
}

// Tamaño de la biblioteca
try {
  const sizeOutput = execSync("du -sh http/ dist/").toString();
  const sizes = sizeOutput.trim().split("\n");

  console.log(`\n${colors.yellow}📦 Tamaño:${colors.reset}`);
  for (const size of sizes) {
    const [value, folder] = size.trim().split("\t");
    console.log(`  - ${path.basename(folder)}: ${value}`);
  }

  // Tamaño del paquete npm
  const npmOutput = execSync("npm pack --json").toString();
  const npmInfo = JSON.parse(npmOutput)[0];

  console.log(`  - Paquete npm: ${(npmInfo.size / 1024).toFixed(2)} KB`);
  console.log(`  - Instalado: ${(npmInfo.unpackedSize / 1024).toFixed(2)} KB`);
} catch (error) {
  console.log(
    `  ⚠️ No se pudo obtener información de tamaño: ${error.message}`
  );
}

// Dependencias
console.log(`\n${colors.yellow}🔗 Dependencias:${colors.reset}`);
console.log(
  `  - Producción: ${Object.keys(packageJson.dependencies || {}).length}`
);
console.log(
  `  - Desarrollo: ${Object.keys(packageJson.devDependencies || {}).length}`
);
console.log(
  `  - Opcionales: ${
    Object.keys(packageJson.optionalDependencies || {}).length
  }`
);

// Verificar vulnerabilidades
try {
  execSync("npm audit --production");
  console.log(
    `\n${colors.green}✅ No se encontraron vulnerabilidades${colors.reset}`
  );
} catch (error) {
  console.log(
    `\n${colors.red}⚠️ Se encontraron vulnerabilidades. Ejecuta 'npm audit' para más detalles${colors.reset}`
  );
}

console.log(
  `\n${colors.bright}${colors.green}🚀 Biblioteca lista para publicación${colors.reset}\n`
);
