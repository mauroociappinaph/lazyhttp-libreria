/**
 * Ejemplo avanzado de uso de LazyHTTP con la API de Datos de Buenos Aires
 * utilizando métodos regulares (versión corregida)
 */

const { http } = require("../dist/http-index");
const fs = require("fs");
const path = require("path");

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
 * Configurar HTTPClient como un cliente específico para esta API
 */
async function setupHttpClient() {
  console.log("🛠️ Configurando cliente HTTP para la API de Buenos Aires...");

  await http.initialize({
    baseUrl: GBA_API_URL,
    timeout: 15000,
    retries: 1,
    headers: {
      Accept: "application/json",
      "User-Agent": "LazyHTTP-Client/1.0",
    },
  });

  console.log(`✅ Cliente HTTP configurado correctamente`);
}

/**
 * Versión corregida: Obtener grupos usando get normal
 */
async function obtenerGrupos() {
  console.log("\n👥 Obteniendo grupos...");

  try {
    // Usar método get normal
    const response = await http.get(`${GBA_API_URL}/group_list`, {
      params: { all_fields: true },
    });

    if (response.error) {
      console.error("❌ Error al obtener grupos:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.result.length} grupos`);
    console.log("Primeros 5 grupos:");

    response.data.result.slice(0, 5).forEach((grupo, index) => {
      console.log(
        `${index + 1}. ${grupo.display_name} (${grupo.package_count} datasets)`
      );
    });

    return response.data.result;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Versión corregida: Obtener licencias usando get normal
 */
async function obtenerLicencias() {
  console.log("\n📜 Obteniendo licencias...");

  try {
    const response = await http.get(`${GBA_API_URL}/license_list`);

    if (response.error) {
      console.error("❌ Error al obtener licencias:", response.error);
      return null;
    }

    console.log(`✅ Se encontraron ${response.data.result.length} licencias`);
    console.log("Listado de licencias:");

    response.data.result.forEach((licencia, index) => {
      console.log(`${index + 1}. ${licencia.title || licencia.id}`);
    });

    return response.data.result;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Versión corregida: Búsqueda avanzada usando get normal
 */
async function busquedaAvanzada(query, filtros = {}) {
  console.log(`\n🔍 Realizando búsqueda avanzada para: "${query}"...`);

  try {
    // Construir parámetros de búsqueda
    const params = {
      q: query,
      rows: 10,
      facet: "on",
      "facet.field": '["organization", "groups", "tags", "license_id"]',
    };

    // Añadir filtros (si los hay)
    if (Object.keys(filtros).length > 0) {
      const fqParts = [];
      for (const [key, value] of Object.entries(filtros)) {
        fqParts.push(`${key}:${value}`);
      }
      params.fq = fqParts.join(" AND ");
    }

    // Usar método get normal
    const response = await http.get(`${GBA_API_URL}/package_search`, {
      params,
    });

    if (response.error) {
      console.error("❌ Error en búsqueda avanzada:", response.error);
      return null;
    }

    const result = response.data.result;
    console.log(
      `✅ Se encontraron ${result.count} datasets que coinciden con la búsqueda`
    );

    // Mostrar resultados
    console.log("\nResultados:");
    result.results.slice(0, 5).forEach((dataset, index) => {
      console.log(`\n📁 ${index + 1}. ${dataset.title}`);
      console.log(
        `   Organización: ${dataset.organization?.title || "No especificada"}`
      );
      console.log(`   Licencia: ${dataset.license_title || "No especificada"}`);
      console.log(
        `   Etiquetas: ${
          dataset.tags?.map?.((t) => t.name)?.join?.(", ") || "Ninguna"
        }`
      );
    });

    // Mostrar facetas
    console.log("\nFacetas disponibles para refinar la búsqueda:");
    for (const [facetName, facetData] of Object.entries(
      result.search_facets || {}
    )) {
      if (facetData.items && facetData.items.length > 0) {
        console.log(`\n${facetName.toUpperCase()}:`);
        facetData.items.slice(0, 3).forEach((item) => {
          console.log(`- ${item.display_name} (${item.count})`);
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error inesperado:", error);
    return null;
  }
}

/**
 * Versión corregida: Generar informe usando get normal
 */
async function generarInforme(organization) {
  console.log(
    `\n📊 Generando informe para la organización: "${organization}"...`
  );

  try {
    // Obtener datasets de la organización
    const response = await http.get(`${GBA_API_URL}/package_search`, {
      params: {
        fq: `organization:${organization}`,
        rows: 100,
      },
    });

    if (response.error) {
      console.error("❌ Error al generar informe:", response.error);
      return null;
    }

    const datasets = response.data.result.results;
    console.log(`✅ Analizando ${datasets.length} datasets de la organización`);

    // Realizar análisis
    const analisis = {
      total_datasets: datasets.length,
      formatos: {},
      etiquetas: {},
      recursos_por_dataset:
        datasets
          .map((d) => d.resources?.length || 0)
          .reduce((a, b) => a + b, 0) / datasets.length,
      datasets_por_licencia: {},
      datasets_por_año: {},
    };

    // Procesar datos
    datasets.forEach((dataset) => {
      // Analizar formatos
      dataset.resources?.forEach((recurso) => {
        const formato = recurso.format?.toLowerCase() || "desconocido";
        analisis.formatos[formato] = (analisis.formatos[formato] || 0) + 1;
      });

      // Analizar etiquetas
      dataset.tags?.forEach((tag) => {
        analisis.etiquetas[tag.name] = (analisis.etiquetas[tag.name] || 0) + 1;
      });

      // Analizar licencias
      const licencia = dataset.license_id || "desconocida";
      analisis.datasets_por_licencia[licencia] =
        (analisis.datasets_por_licencia[licencia] || 0) + 1;

      // Analizar años de publicación
      if (dataset.metadata_created) {
        const año = new Date(dataset.metadata_created).getFullYear();
        analisis.datasets_por_año[año] =
          (analisis.datasets_por_año[año] || 0) + 1;
      }
    });

    // Ordenar los resultados
    analisis.formatos = Object.entries(analisis.formatos)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    analisis.etiquetas = Object.entries(analisis.etiquetas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

    // Guardar informe
    const nombreArchivo = `informe_${organization}_${Date.now()}.json`;
    const rutaArchivo = path.join(__dirname, nombreArchivo);

    fs.writeFileSync(rutaArchivo, JSON.stringify(analisis, null, 2));
    console.log(`✅ Informe guardado en: ${nombreArchivo}`);

    // Mostrar resumen
    console.log("\nResumen del informe:");
    console.log(`Total de datasets: ${analisis.total_datasets}`);
    console.log(
      `Promedio de recursos por dataset: ${analisis.recursos_por_dataset.toFixed(
        2
      )}`
    );
    console.log(
      `Formatos más comunes: ${Object.keys(analisis.formatos)
        .slice(0, 3)
        .join(", ")}`
    );
    console.log(
      `Etiquetas más utilizadas: ${Object.keys(analisis.etiquetas)
        .slice(0, 3)
        .join(", ")}`
    );

    return analisis;
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
      "🚀 Iniciando ejemplos avanzados con la API de Datos de Buenos Aires..."
    );

    // Inicializar http con la URL base correcta
    await setupHttpClient();

    // 1. Obtener grupos
    const grupos = await obtenerGrupos();

    // 2. Obtener licencias
    const licencias = await obtenerLicencias();

    // 3. Realizar una búsqueda avanzada
    await busquedaAvanzada("educación", { tags: "datos abiertos" });

    // 4. Generar un informe para una organización
    // Elegir una organización de la lista de grupos
    if (grupos && grupos.length > 0) {
      const organizacion =
        grupos.find((g) => g.package_count > 5)?.name || grupos[0].name;
      await generarInforme(organizacion);
    }

    console.log("\n✨ Ejemplos avanzados completados exitosamente");
  } catch (error) {
    console.error("Error fatal:", error);
  }
}

// Ejecutar
main();
