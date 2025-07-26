// eslint-disable-next-line no-undef
/* global console, process */
import esbuild from "esbuild";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const DIST_PROD_DIR = join(__dirname, "..", "dist-prod");

// Limpiar directorios de salida
fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.rmSync(DIST_PROD_DIR, { recursive: true, force: true });

async function build() {
  console.log("Iniciando construcción con esbuild...");

  // Configuración base para esbuild
  const baseConfig = {
    bundle: true,
    minify: true,
    sourcemap: false,
    platform: "node",
    target: "es2018",
    external: ["axios", "https-proxy-agent", "socks-proxy-agent", "fs"], // Marcar dependencias externas
  };

  // Construir versión para Node.js (CommonJS)
  await esbuild.build({
    ...baseConfig,
    entryPoints: [join(__dirname, "..", "http", "index.ts")],
    outfile: join(DIST_DIR, "index.js"),
    format: "cjs",
  });

  // Construir versión para navegador (ESM)
  await esbuild.build({
    ...baseConfig,
    entryPoints: [join(__dirname, "..", "http", "client", "index.ts")],
    outfile: join(DIST_DIR, "client", "index.js"),
    format: "esm",
    platform: "browser",
  });

  // Construir versión para servidor (ESM)
  await esbuild.build({
    ...baseConfig,
    entryPoints: [join(__dirname, "..", "http", "server", "index.ts")],
    outfile: join(DIST_DIR, "server", "index.js"),
    format: "esm",
  });

  // Copiar archivos de declaración (.d.ts) generados por tsc
  // esbuild no genera .d.ts, así que tsc sigue siendo necesario para eso
  console.log("Copiando archivos de declaración...");
  execSync("tsc --emitDeclarationOnly --outDir " + DIST_DIR, {
    stdio: "inherit",
  });

  console.log("Construcción con esbuild finalizada.");
}

build().catch((error) => {
  console.error("Error durante la construcción con esbuild:", error);
  process.exit(1);
});
