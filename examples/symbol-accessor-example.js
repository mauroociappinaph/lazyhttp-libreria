/**
 * Ejemplo de uso de LazyHTTP con resource accessors usando símbolos
 * Esto permite un acceso más limpio y con autocompletado a los recursos
 */

// Importamos la biblioteca http y los símbolos de recursos predefinidos
const { http, User, Product, Category } = require("../dist/http-index");

// URL base de la API (usando JSONPlaceholder como ejemplo)
const API_URL = "https://jsonplaceholder.typicode.com";

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

/**
 * Obtener usuarios usando el accessor de símbolo
 */
async function obtenerUsuarios() {
  console.log("\n👥 Obteniendo usuarios usando el símbolo User...");

  try {
    // Usar el símbolo User en lugar de 'users'
    const response = await http.get[User]();

    if (response.error) {
      console.error("❌ Error al obtener usuarios:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.length} usuarios`);
    console.log("Primeros 3 usuarios:");
    response.data.slice(0, 3).forEach((usuario, index) => {
      console.log(`${index + 1}. ${usuario.name} (${usuario.email})`);
    });

    return response.data;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Obtener un usuario específico por ID
 */
async function obtenerUsuarioPorId(id) {
  console.log(`\n👤 Obteniendo detalles del usuario ID: ${id}...`);

  try {
    // Usar el símbolo User con getById
    const response = await http.getById[User](id);

    if (response.error) {
      console.error(`❌ Error al obtener usuario ${id}:`, response.error);
      return null;
    }

    console.log("✅ Usuario encontrado:");
    console.log(`Nombre: ${response.data.name}`);
    console.log(`Email: ${response.data.email}`);
    console.log(`Teléfono: ${response.data.phone}`);
    console.log(`Website: ${response.data.website}`);

    return response.data;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Obtener posts usando el accessor de símbolo
 */
async function obtenerPosts() {
  console.log("\n📝 Obteniendo posts...");

  try {
    // Usar el símbolo Post (se convertirá automáticamente a 'posts')
    const response = await http.get[Post]();

    if (response.error) {
      console.error("❌ Error al obtener posts:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.length} posts`);
    console.log("Primeros 3 posts:");
    response.data.slice(0, 3).forEach((post, index) => {
      console.log(`${index + 1}. ${post.title.substring(0, 40)}...`);
    });

    return response.data;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Crear un nuevo usuario (ejemplo de POST)
 */
async function crearUsuario(userData) {
  console.log("\n➕ Creando nuevo usuario...");

  try {
    // Usar el símbolo User con post
    const response = await http.post[User](userData);

    if (response.error) {
      console.error("❌ Error al crear usuario:", response.error);
      return null;
    }

    console.log("✅ Usuario creado exitosamente:");
    console.log(`ID: ${response.data.id}`);
    console.log(`Nombre: ${response.data.name}`);
    console.log(`Email: ${response.data.email}`);

    return response.data;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Función principal para ejecutar los ejemplos
 */
async function main() {
  try {
    console.log("🚀 Iniciando pruebas con resource accessors por símbolo...");

    // Inicializar http con la URL base de la API
    await http.initialize({
      baseUrl: API_URL,
      timeout: 10000,
      retries: 1,
    });

    console.log(`✅ Cliente HTTP inicializado con URL base: ${http._baseUrl}`);

    // Definir un símbolo para Post (normalmente importado de la biblioteca)
    const Post = Symbol("Post");

    // 1. Obtener usuarios usando símbolo
    const usuarios = await obtenerUsuarios();

    // 2. Obtener detalles de un usuario específico
    if (usuarios && usuarios.length > 0) {
      await obtenerUsuarioPorId(usuarios[0].id);
    }

    // 3. Obtener posts
    await obtenerPosts();

    // 4. Crear un nuevo usuario
    await crearUsuario({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "555-1234",
      website: "janedoe.com",
    });

    console.log("\n✨ Pruebas completadas exitosamente");
  } catch (error) {
    console.error("Error fatal:", error);
  }
}

// Ejecutar el ejemplo
main();
