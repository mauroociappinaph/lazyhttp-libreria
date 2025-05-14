import FormData from 'form-data';
import fs from 'fs';

/**
 * Construye un FormData listo para enviar archivos y campos en Node.js
 * @param fields Objeto con campos: puede incluir strings, buffers, streams o paths de archivo
 * @returns { form, headers }
 */
export function buildNodeFormData(fields: Record<string, any>): { form: FormData, headers: any } {
  const form = new FormData();
  for (const key in fields) {
    const value = fields[key];
    // Si es string y es un path de archivo válido, lo convierte a stream
    if (typeof value === 'string' && fs.existsSync(value) && fs.statSync(value).isFile()) {
      form.append(key, fs.createReadStream(value));
    } else {
      form.append(key, value);
    }
  }
  return { form, headers: form.getHeaders() };
}
