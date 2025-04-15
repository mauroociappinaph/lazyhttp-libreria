import { http } from '../dist/http-index';

async function main() {
  // Inicializar el cliente HTTP
  await http.initialize({
    // Solo usamos las propiedades que acepta la interfaz
    cache: {
      enabled: true,
      defaultTTL: 300000 // 5 minutos
    }
  });

  // Ejemplo 1: Usar un proxy global
  console.log('Configurando proxy global...');
  http.configureProxy({
    url: 'http://127.0.0.1:8080', // Proxy local (mitmproxy)
    protocol: 'http'
  });

  // Ejemplo 2: Descargar un archivo grande usando streaming
  console.log('Iniciando descarga con streaming...');
  try {
    const stream = await http.stream('https://speed.hetzner.de/100MB.bin', {
      stream: {
        chunkSize: 16384, // 16KB chunks
        onChunk: (chunk) => {
          console.log(`Recibido chunk de ${chunk.length} bytes`);
        },
        onEnd: () => {
          console.log('Descarga completada');
        },
        onError: (error) => {
          console.error('Error durante la descarga:', error);
        }
      }
    });

    // Procesar el stream
    for await (const chunk of stream) {
      // Aquí puedes procesar cada chunk como necesites
      // Por ejemplo, escribir a un archivo
      console.log('Procesando chunk...');
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Ejemplo 3: Hacer una petición usando un proxy específico
  console.log('Haciendo petición con proxy específico...');
  try {
    const response = await http.get('https://httpbin.org/get', {
      proxy: {
        url: 'http://127.0.0.1:8080',
        protocol: 'http'
      }
    });
    console.log('Respuesta:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar el ejemplo
main().catch(console.error);
