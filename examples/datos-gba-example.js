/**
 * Ejemplo de uso de LazyHTTP con la API de Datos de la Provincia de Buenos Aires
 * https://catalogo.datos.gba.gob.ar/api/3/action/
 */

const { http } = require("../dist/http-index");

// URL base de la API
const GBA_API_URL = "https://catalogo.datos.gba.gob.ar/api/3/action";

// Simular localStorage para Node.js (necesario para http.initialize)
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
 * Obtiene la lista de paquetes de datos (datasets) disponibles
 */
async function obtenerDatasets(limit = 5) {
  console.log(`\n📊 Obteniendo lista de datasets (limit: ${limit})...`);

  try {
    const response = await http.request(`${GBA_API_URL}/package_list`, {
      method: "GET",
      params: { limit },
    });

    if (response.error) {
      console.error("❌ Error al obtener datasets:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.result.length} datasets`);
    console.log("Primeros datasets:", response.data.result.slice(0, 5));

    return response.data.result;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Busca datasets según términos de búsqueda
 */
async function buscarDatasets(query) {
  console.log(`\n🔍 Buscando datasets con la consulta: "${query}"...`);

  try {
    const response = await http.request(`${GBA_API_URL}/package_search`, {
      method: "GET",
      params: { q: query, rows: 5 },
    });

    if (response.error) {
      console.error("❌ Error al buscar datasets:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.result.count} resultados`);

    // Mostrar información sobre los resultados
    response.data.result.results.forEach((dataset, index) => {
      console.log(`\n📁 Dataset ${index + 1}: ${dataset.title}`);
      console.log(`ID: ${dataset.id}`);
      console.log(
        `Organización: ${dataset.organization?.title || "No especificada"}`
      );
      console.log(`Recursos: ${dataset.resources?.length || 0}`);
    });

    return response.data.result;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Obtiene información detallada de un dataset específico
 */
async function obtenerDetalleDataset(datasetId) {
  console.log(`\n📋 Obteniendo detalle del dataset ID: ${datasetId}...`);

  try {
    const response = await http.request(`${GBA_API_URL}/package_show`, {
      method: "GET",
      params: { id: datasetId },
    });

    if (response.error) {
      console.error("❌ Error al obtener detalle del dataset:", response.error);
      return null;
    }

    const dataset = response.data.result;

    console.log(`✅ Dataset: ${dataset.title}`);
    console.log(`Descripción: ${dataset.notes?.substring(0, 150)}...`);
    console.log(
      `Organización: ${dataset.organization?.title || "No especificada"}`
    );
    console.log(`Autor: ${dataset.author || "No especificado"}`);
    console.log(
      `Última actualización: ${dataset.metadata_modified || "No especificada"}`
    );

    console.log("\nRecursos disponibles:");
    dataset.resources.forEach((recurso, index) => {
      console.log(
        `${index + 1}. ${recurso.name} (${
          recurso.format || "Formato no especificado"
        })`
      );
    });

    return dataset;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Obtiene información sobre las organizaciones
 */
async function obtenerOrganizaciones() {
  console.log(`\n🏢 Obteniendo lista de organizaciones...`);

  try {
    const response = await http.request(`${GBA_API_URL}/organization_list`, {
      method: "GET",
      params: { all_fields: true },
    });

    if (response.error) {
      console.error("❌ Error al obtener organizaciones:", response.error);
      return null;
    }

    console.log(
      `✅ Se encontraron ${response.data.result.length} organizaciones`
    );

    // Mostrar las primeras 5 organizaciones
    response.data.result.slice(0, 5).forEach((org, index) => {
      console.log(
        `${index + 1}. ${org.display_name || org.name} (${
          org.package_count || 0
        } datasets)`
      );
    });

    return response.data.result;
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
    console.log("🚀 Iniciando pruebas con la API de Datos de Buenos Aires...");

    // Inicializar http con la URL base de la API
    await http.initialize({
      baseUrl: GBA_API_URL,
      timeout: 10000,
      retries: 1,
    });

    console.log(`✅ Cliente HTTP inicializado con URL base: ${http._baseUrl}`);

    // 1. Obtener lista de datasets
    await obtenerDatasets(5);

    // 2. Buscar datasets relacionados con salud
    await buscarDatasets("salud");

    // 3. Obtener información de un dataset específico (usando el primero de la lista)
    const datasets = await obtenerDatasets(1);
    if (datasets && datasets.length > 0) {
      await obtenerDetalleDataset(datasets[0]);
    }

    // 4. Obtener información sobre organizaciones
    await obtenerOrganizaciones();

    console.log("\n✨ Pruebas completadas exitosamente");
  } catch (error) {
    console.error("Error fatal:", error);
  }
}

// Ejecutar el ejemplo
main();
