import { http } from '../http/client';

async function ejemploFullMeta() {
  const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
  console.log('Respuesta completa:', response);
  console.log('Headers enviados:', response.fullMeta?.requestHeaders);
  console.log('Headers recibidos:', response.fullMeta?.responseHeaders);
  console.log('Tiempos:', response.fullMeta?.timing);
}

ejemploFullMeta().catch(console.error);
