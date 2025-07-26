import FormData from "form-data";
import fs from "fs";

export interface BuildNodeFormDataOptions {
  validateFiles?: boolean; // default true
  maxFileSize?: number; // en bytes
}

/**
 * Construye un FormData listo para enviar archivos y campos en Node.js
 * Soporta múltiples archivos por campo (arrays)
 * Lanza error si un path de archivo no existe o no es un archivo válido (a menos que validateFiles sea false)
 * Permite validar tamaño máximo de archivo (maxFileSize)
 * @param fields Objeto con campos: puede incluir strings, buffers, streams, paths de archivo o arrays de estos
 * @param _reserved (no usar)
 * @param options Opciones de validación
 * @returns { form, headers }
 */
export function buildNodeFormData(
  fields: Record<string, any>,
  _reserved?: any,
  options: BuildNodeFormDataOptions = {}
): { form: FormData; headers: any } {
  const { validateFiles = true, maxFileSize } = options;
  const form = new FormData();
  for (const key in fields) {
    const value = fields[key];
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          if (validateFiles) {
            if (!fs.existsSync(item) || !fs.statSync(item).isFile()) {
              throw new Error(
                `El archivo '${item}' no existe o no es un archivo válido (campo '${key}')`
              );
            }
            if (maxFileSize) {
              const stats = fs.statSync(item);
              if (stats.size > maxFileSize) {
                throw new Error(
                  `Archivo '${item}' excede el tamaño máximo permitido (${maxFileSize} bytes)`
                );
              }
            }
          }
          form.append(key, fs.createReadStream(item));
        } else {
          form.append(key, item);
        }
      });
    } else if (typeof value === "string") {
      if (validateFiles) {
        if (!fs.existsSync(value) || !fs.statSync(value).isFile()) {
          throw new Error(
            `El archivo '${value}' no existe o no es un archivo válido (campo '${key}')`
          );
        }
        if (maxFileSize) {
          const stats = fs.statSync(value);
          if (stats.size > maxFileSize) {
            throw new Error(
              `Archivo '${value}' excede el tamaño máximo permitido (${maxFileSize} bytes)`
            );
          }
        }
      }
      form.append(key, fs.createReadStream(value));
    } else {
      form.append(key, value);
    }
  }
  return { form, headers: form.getHeaders() };
}
