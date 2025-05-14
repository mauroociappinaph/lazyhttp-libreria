import FormData from 'form-data';
import fs from 'fs';

/**
 * Construye un FormData listo para enviar archivos y campos en Node.js
 * Soporta múltiples archivos por campo (arrays)
 * Lanza error si un path de archivo no existe o no es un archivo válido
 * @param fields Objeto con campos: puede incluir strings, buffers, streams, paths de archivo o arrays de estos
 * @returns { form, headers }
 */
export function buildNodeFormData(fields: Record<string, any>): { form: FormData, headers: any } {
  const form = new FormData();
  for (const key in fields) {
    const value = fields[key];
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === 'string') {
          if (fs.existsSync(item) && fs.statSync(item).isFile()) {
            form.append(key, fs.createReadStream(item));
          } else {
            throw new Error(`El archivo '${item}' no existe o no es un archivo válido (campo '${key}')`);
          }
        } else {
          form.append(key, item);
        }
      });
    } else if (typeof value === 'string') {
      if (fs.existsSync(value) && fs.statSync(value).isFile()) {
        form.append(key, fs.createReadStream(value));
      } else {
        throw new Error(`El archivo '${value}' no existe o no es un archivo válido (campo '${key}')`);
      }
    } else {
      form.append(key, value);
    }
  }
  return { form, headers: form.getHeaders() };
}
