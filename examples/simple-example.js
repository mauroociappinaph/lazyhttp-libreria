// Ejemplo básico de uso de LazyHTTP
const { http } = require("../");

// Función para obtener una lista de posts
async function getPosts() {
  console.log("Obteniendo posts...");

  const response = await http.get("https://jsonplaceholder.typicode.com/posts");

  if (response.error) {
    console.error("Error al obtener posts:", response.error);
    return;
  }

  console.log(`✅ Obtenidos ${response.data.length} posts`);
  console.log("Primer post:", response.data[0]);
}

// Función para crear un post
async function createPost() {
  console.log("Creando un nuevo post...");

  const postData = {
    title: "Ejemplo de LazyHTTP",
    body: "Este es un post de ejemplo creado con LazyHTTP",
    userId: 1,
  };

  const response = await http.post(
    "https://jsonplaceholder.typicode.com/posts",
    postData
  );

  if (response.error) {
    console.error("Error al crear post:", response.error);
    return;
  }

  console.log("✅ Post creado con éxito:", response.data);
}

// Función para actualizar un post
async function updatePost(postId) {
  console.log(`Actualizando post ${postId}...`);

  const updateData = {
    title: "Título actualizado con LazyHTTP",
  };

  const response = await http.patch(
    `https://jsonplaceholder.typicode.com/posts/${postId}`,
    updateData
  );

  if (response.error) {
    console.error("Error al actualizar post:", response.error);
    return;
  }

  console.log("✅ Post actualizado con éxito:", response.data);
}

// Función para eliminar un post
async function deletePost(postId) {
  console.log(`Eliminando post ${postId}...`);

  const response = await http.delete(
    `https://jsonplaceholder.typicode.com/posts/${postId}`
  );

  if (response.error) {
    console.error("Error al eliminar post:", response.error);
    return;
  }

  console.log("✅ Post eliminado con éxito");
}

// Ejecutar los ejemplos
async function runExamples() {
  try {
    await http.initialize();

    await getPosts();
    await createPost();
    await updatePost(1);
    await deletePost(1);

    console.log("¡Todos los ejemplos completados!");
  } catch (error) {
    console.error("Error al ejecutar ejemplos:", error);
  }
}

runExamples();
