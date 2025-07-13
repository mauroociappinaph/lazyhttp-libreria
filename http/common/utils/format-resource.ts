import pluralize from 'pluralize';

/**
 * Formatea el nombre de un recurso para estandarizarlo en rutas RESTful.
 *
 * Convierte nombres en PascalCase a minúsculas y los pluraliza si es necesario.
 * No modifica nombres que ya estén en minúsculas y/o plural.
 *
 * @param resourceName El nombre del recurso (ej. "User", "Product", "categories").
 * @returns El nombre del recurso formateado (ej. "users", "products", "categories").
 */
export function formatResource(resourceName: string): string {
  if (!resourceName) {
    return "";
  }

  // Convertir la primera letra a minúscula si está en PascalCase
  let formattedName = resourceName.charAt(0).toLowerCase() + resourceName.slice(1);

  // Pluralizar usando la librería pluralize
  formattedName = pluralize(formattedName);

  return formattedName.toLowerCase();
}
