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

  // Generar archivos de declaración (.d.ts) con tsc en un directorio temporal
  // esbuild no genera .d.ts, así que tsc sigue siendo necesario para eso
  const TEMP_TYPES_DIR = join(__dirname, "..", "dist-temp-types");
  fs.rmSync(TEMP_TYPES_DIR, { recursive: true, force: true }); // Limpiar por si acaso
  console.log("Generando archivos de declaración en directorio temporal...");
  execSync(`tsc --emitDeclarationOnly --outDir ${TEMP_TYPES_DIR}`, {
    stdio: "inherit",
  });

  console.log("Moviendo archivos de declaración a sus ubicaciones finales...");

  // Asegurarse de que los directorios de destino existan
  fs.mkdirSync(join(DIST_DIR, "client"), { recursive: true });
  fs.mkdirSync(join(DIST_DIR, "server"), { recursive: true });

  // Mover index.d.ts principal
  fs.copyFileSync(
    join(TEMP_TYPES_DIR, "http", "index.d.ts"),
    join(DIST_DIR, "index.d.ts")
  );

  // Mover client/index.d.ts
  fs.copyFileSync(
    join(TEMP_TYPES_DIR, "http", "client", "index.d.ts"),
    join(DIST_DIR, "client", "index.d.ts")
  );

  // Mover server/index.d.ts
  fs.copyFileSync(
    join(TEMP_TYPES_DIR, "http", "server", "index.d.ts"),
    join(DIST_DIR, "server", "index.d.ts")
  );

  // Copiar el resto de los archivos .d.ts de http/ a dist/http/
  fs.cpSync(join(TEMP_TYPES_DIR, "http"), join(DIST_DIR, "http"), {
    recursive: true,
    force: true,
  });

  // Limpiar el directorio temporal
  fs.rmSync(TEMP_TYPES_DIR, { recursive: true, force: true });

  console.log("Construcción con esbuild finalizada.");
}

build().catch((error) => {
  console.error("Error durante la construcción con esbuild:", error);
  process.exit(1);
});
