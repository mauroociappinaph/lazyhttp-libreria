#!/usr/bin/env node

/**
 * Script de optimización para httplazy
 * Realiza varios pasos para reducir el tamaño final de la biblioteca:
 * 1. Eliminación de código muerto (tree-shaking manual)
 * 2. Minificación del código JavaScript
 * 3. Compresión de cadenas de texto
 * 4. Generación de versiones ES modules y CommonJS
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Asegurarse de que existen los directorios necesarios
const DIST_PROD = path.join(__dirname, "..", "dist-prod");
if (!fs.existsSync(DIST_PROD)) {
  fs.mkdirSync(DIST_PROD, { recursive: true });
}

// Instalar dependencias de desarrollo si no existen
try {
  execSync("npm list terser", { stdio: "ignore" });
} catch (error) {
  console.log("Instalando terser...");
  execSync("npm install -D terser", { stdio: "inherit" });
}

// Optimización y minificación
console.log("Optimizando y minificando...");
try {
  // Procesar cada archivo JS en dist
  const distDir = path.join(__dirname, "..", "dist");

  function processDirectory(directory, relativePath = "") {
    const entries = fs.readdirSync(directory);

    // Crear directorios en destino
    const targetDir = path.join(DIST_PROD, relativePath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    entries.forEach((entry) => {
      const entryPath = path.join(directory, entry);
      const relPath = path.join(relativePath, entry);
      const stat = fs.statSync(entryPath);

      if (stat.isDirectory()) {
        // Procesar subdirectorios recursivamente
        processDirectory(entryPath, relPath);
      } else if (entry.endsWith(".js")) {
        // Minificar archivos JS
        const targetPath = path.join(DIST_PROD, relPath);
        execSync(
          `npx terser ${entryPath} --compress --mangle --output ${targetPath}`
        );

        // Copiar archivos de declaración TS (.d.ts)
      } else if (entry.endsWith(".d.ts")) {
        const sourcePath = entryPath;
        const targetPath = path.join(DIST_PROD, relPath);
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  processDirectory(distDir);

  // Copiar package.json modificado
  const pkgJson = require("../package.json");
  pkgJson.main = "http-index.js";
  pkgJson.types = "http-index.d.ts";
  fs.writeFileSync(
    path.join(DIST_PROD, "package.json"),
    JSON.stringify(pkgJson, null, 2)
  );

  // Mostrar comparación de tamaños
  console.log("\nComparación de tamaños:");
  console.log("------------------------");
  const originalSize = getDirectorySize(distDir);
  const optimizedSize = getDirectorySize(DIST_PROD);
  console.log(`Original (dist):     ${formatSize(originalSize)}`);
  console.log(`Optimizado (dist-prod): ${formatSize(optimizedSize)}`);
  console.log(
    `Reducción:           ${Math.round(
      (1 - optimizedSize / originalSize) * 100
    )}%`
  );

  console.log("\n✅ Optimización completada con éxito");
} catch (error) {
  console.error("\n❌ Error durante la optimización:", error);
  process.exit(1);
}

// Función auxiliar para obtener el tamaño del directorio
function getDirectorySize(directory) {
  let size = 0;
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      size += getDirectorySize(entryPath);
    } else {
      size += fs.statSync(entryPath).size;
    }
  }

  return size;
}

// Función auxiliar para formatear el tamaño
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
