#!/usr/bin/env node

const { http } = require("../");
const version = require("../package.json").version;

function printHelp() {
  console.log(`
  LazyHTTP CLI v${version}

  Uso:
    lazyhttp <método> <url> [opciones]

  Métodos:
    get     Realizar una petición GET
    post    Realizar una petición POST
    put     Realizar una petición PUT
    patch   Realizar una petición PATCH
    delete  Realizar una petición DELETE

  Ejemplos:
    lazyhttp get https://jsonplaceholder.typicode.com/posts
    lazyhttp post https://jsonplaceholder.typicode.com/posts --data '{"title":"Ejemplo","body":"Contenido"}'

  Opciones:
    --help, -h       Mostrar esta ayuda
    --version, -v    Mostrar la versión
    --data, -d       Enviar datos JSON (para POST, PUT, PATCH)
    --headers, -H    Enviar cabeceras personalizadas (formato JSON)
    --timeout, -t    Establecer timeout en milisegundos
    --retries, -r    Número de reintentos
    --auth, -a       Incluir autenticación (requiere token en localStorage)
  `);
}

// Función principal
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log(`LazyHTTP v${version}`);
    return;
  }

  const method = args[0].toLowerCase();
  const url = args[1];

  if (!url) {
    console.error("Error: Se requiere una URL.");
    printHelp();
    return;
  }

  const options = {
    headers: {},
    withAuth: false,
  };

  let data = null;

  // Procesar opciones
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    if ((arg === "--data" || arg === "-d") && i + 1 < args.length) {
      try {
        data = JSON.parse(args[++i]);
      } catch (error) {
        console.error("Error: El formato de datos JSON es inválido.");
        return;
      }
    }

    if ((arg === "--headers" || arg === "-H") && i + 1 < args.length) {
      try {
        options.headers = JSON.parse(args[++i]);
      } catch (error) {
        console.error("Error: El formato de cabeceras JSON es inválido.");
        return;
      }
    }

    if ((arg === "--timeout" || arg === "-t") && i + 1 < args.length) {
      options.timeout = parseInt(args[++i], 10);
    }

    if ((arg === "--retries" || arg === "-r") && i + 1 < args.length) {
      options.retries = parseInt(args[++i], 10);
    }

    if (arg === "--auth" || arg === "-a") {
      options.withAuth = true;
    }
  }

  try {
    // Inicializar el cliente HTTP
    await http.initialize();

    let response;

    // Ejecutar la petición según el método
    switch (method) {
      case "get":
        response = await http.get(url, options);
        break;
      case "post":
        response = await http.post(url, data, options);
        break;
      case "put":
        response = await http.put(url, data, options);
        break;
      case "patch":
        response = await http.patch(url, data, options);
        break;
      case "delete":
        response = await http.delete(url, options);
        break;
      default:
        console.error(`Error: Método "${method}" no soportado.`);
        printHelp();
        return;
    }

    // Mostrar el resultado
    if (response.error) {
      console.error(`Error (${response.status}): ${response.error}`);
      process.exit(1);
    } else {
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error("Error inesperado:", error);
    process.exit(1);
  }
}

// Simular localStorage para Node.js
if (typeof localStorage === "undefined") {
  global.localStorage = {
    _data: {},
    setItem(id, val) {
      this._data[id] = String(val);
    },
    getItem(id) {
      return this._data[id] || null;
    },
    removeItem(id) {
      delete this._data[id];
    },
    clear() {
      this._data = {};
    },
  };
}

// Ejecutar el CLI
main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
