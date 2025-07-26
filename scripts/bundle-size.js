const fs = require("fs");
const { minify } = require("terser");
const zlib = require("zlib");
const path = require("path");

const inputFile = path.resolve(__dirname, "../dist/httplazy.js"); // Ahora mide el bundle real
const minFile = path.resolve(__dirname, "../index.min.js");
const gzipFile = path.resolve(__dirname, "../index.min.js.gz");

async function main() {
  if (!fs.existsSync(inputFile)) {
    console.error(`Archivo de entrada no encontrado: ${inputFile}`);
    process.exit(1);
  }
  const code = fs.readFileSync(inputFile, "utf8");
  // Minificar
  const minified = await minify(code);
  fs.writeFileSync(minFile, minified.code, "utf8");
  // Comprimir gzip
  const gzipped = zlib.gzipSync(minified.code);
  fs.writeFileSync(gzipFile, gzipped);
  // Tamaños
  const minSize = fs.statSync(minFile).size;
  const gzipSize = fs.statSync(gzipFile).size;
  console.log(`Tamaño minificado: ${(minSize / 1024).toFixed(2)} KB`);
  console.log(`Tamaño min+gzip: ${(gzipSize / 1024).toFixed(2)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
