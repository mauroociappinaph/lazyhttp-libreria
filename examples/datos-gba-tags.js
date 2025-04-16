/**
 * Ejemplo de uso de LazyHTTP con los métodos específicos (get, getAll)
 * para explorar los tags/etiquetas en la API de Datos de Buenos Aires
 *
 * Este ejemplo muestra cómo usar los métodos específicos de la biblioteca
 * y cómo trabajar con la API de etiquetas/tags.
 */

const { http } = require("../dist/http-index");

// URL base de la API
const GBA_API_URL = "https://catalogo.datos.gba.gob.ar/api/3/action";

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
 * Obtiene la lista de etiquetas (tags) utilizando el método get
 */
async function obtenerTags(limit = 20) {
  console.log(`\n🏷️ Obteniendo las ${limit} etiquetas más utilizadas...`);

  try {
    // Usar método get con URL completa
    const response = await http.get(`${GBA_API_URL}/tag_list`, {
      params: {
        all_fields: true,
        limit,
      },
    });

    if (response.error) {
      console.error("❌ Error al obtener etiquetas:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.result.length} etiquetas`);

    // Ordenar por frecuencia de uso (de mayor a menor)
    const tagsOrdenados = [...response.data.result]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    console.log("\nLas 10 etiquetas más utilizadas:");
    tagsOrdenados.forEach((tag, index) => {
      console.log(
        `${index + 1}. ${tag.name || tag.display_name} (${tag.count} datasets)`
      );
    });

    return response.data.result;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Busca datasets por etiqueta usando getById
 */
async function datasetsConEtiqueta(tagName) {
  console.log(`\n📊 Buscando datasets con la etiqueta: "${tagName}"...`);

  try {
    // Usar el método getById (adaptado a la API)
    const response = await http.get(`${GBA_API_URL}/package_search`, {
      params: {
        fq: `tags:${tagName}`,
        rows: 5,
      },
    });

    if (response.error) {
      console.error(
        `❌ Error al buscar datasets con la etiqueta ${tagName}:`,
        response.error
      );
      return null;
    }

    const datasets = response.data.result.results;
    console.log(
      `✅ Se encontraron ${response.data.result.count} datasets con la etiqueta "${tagName}"`
    );

    // Mostrar información resumida
    datasets.forEach((dataset, index) => {
      console.log(`\n📁 Dataset ${index + 1}: ${dataset.title}`);
      console.log(`ID: ${dataset.id}`);
      console.log(`Etiquetas: ${dataset.tags.map((t) => t.name).join(", ")}`);
    });

    return datasets;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Analiza la distribución de etiquetas por organización
 */
async function analizarEtiquetasPorOrganizacion(tagName, limit = 5) {
  console.log(
    `\n📊 Analizando uso de la etiqueta "${tagName}" por organización...`
  );

  try {
    const response = await http.get(`${GBA_API_URL}/package_search`, {
      params: {
        fq: `tags:${tagName}`,
        rows: 100,
        facet: "on",
        "facet.field": '["organization"]',
      },
    });

    if (response.error) {
      console.error(
        `❌ Error al analizar etiqueta ${tagName}:`,
        response.error
      );
      return null;
    }

    // Procesar facetas para obtener conteo por organización
    const facetOrg =
      response.data.result.search_facets?.organization?.items || [];

    console.log(
      `✅ Distribución de la etiqueta "${tagName}" por organización:`
    );

    // Ordenar por cantidad y mostrar las primeras
    facetOrg
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .forEach((org, index) => {
        console.log(`${index + 1}. ${org.display_name}: ${org.count} datasets`);
      });

    return facetOrg;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Encuentra etiquetas relacionadas en base a co-ocurrencia
 */
async function encontrarEtiquetasRelacionadas(tagName) {
  console.log(`\n🔄 Buscando etiquetas relacionadas con "${tagName}"...`);

  try {
    // Obtener datasets con esta etiqueta
    const response = await http.get(`${GBA_API_URL}/package_search`, {
      params: {
        fq: `tags:${tagName}`,
        rows: 50,
      },
    });

    if (response.error) {
      console.error(
        `❌ Error al buscar etiquetas relacionadas con ${tagName}:`,
        response.error
      );
      return null;
    }

    // Extraer todas las etiquetas y contar ocurrencias
    const datasets = response.data.result.results;
    const contadorEtiquetas = {};

    datasets.forEach((dataset) => {
      dataset.tags.forEach((tag) => {
        // No contar la etiqueta que estamos analizando
        if (tag.name !== tagName) {
          contadorEtiquetas[tag.name] = (contadorEtiquetas[tag.name] || 0) + 1;
        }
      });
    });

    // Convertir a array y ordenar
    const etiquetasRelacionadas = Object.entries(contadorEtiquetas)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    console.log(`✅ Etiquetas frecuentemente asociadas con "${tagName}":`);
    etiquetasRelacionadas.forEach((tag, index) => {
      console.log(`${index + 1}. ${tag.name} (${tag.count} co-ocurrencias)`);
    });

    return etiquetasRelacionadas;
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
    console.log(
      "🚀 Iniciando análisis de etiquetas en la API de Datos de Buenos Aires..."
    );

    // Inicializar http con la URL base correcta
    await http.initialize({
      baseUrl: GBA_API_URL,
      timeout: 15000,
      retries: 1,
    });

    console.log(`✅ Cliente HTTP inicializado con URL base: ${http._baseUrl}`);

    // 1. Obtener las etiquetas más utilizadas
    const tags = await obtenerTags(100);

    if (tags && tags.length > 0) {
      // Buscar una etiqueta interesante para analizar (con buena cantidad de datasets)
      const tagToAnalyze = tags.find((t) => t.count > 10)?.name || tags[0].name;

      // 2. Buscar datasets con esa etiqueta
      await datasetsConEtiqueta(tagToAnalyze);

      // 3. Analizar distribución por organización
      await analizarEtiquetasPorOrganizacion(tagToAnalyze);

      // 4. Encontrar etiquetas relacionadas
      await encontrarEtiquetasRelacionadas(tagToAnalyze);
    }

    console.log("\n✨ Análisis de etiquetas completado exitosamente");
  } catch (error) {
    console.error("Error fatal:", error);
  }
}

// Ejecutar
main();
