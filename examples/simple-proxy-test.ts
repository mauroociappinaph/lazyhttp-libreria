import { http } from '../http/http-index';

// Función para simular localStorage en Node.js
if (typeof window === 'undefined') {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  };
}

async function main() {
  console.log('Iniciando prueba de proxy y streaming...');

  // Configurar proxy global
  console.log('Configurando proxy global...');
  http.configureProxy({
    url: 'http://127.0.0.1:8080',
    protocol: 'http',
    rejectUnauthorized: false
  });

  // Probar streaming con datos JSON
  console.log('\nProbando streaming de datos JSON...');
  try {
    let chunkCount = 0;
    const stream = await http.stream('https://httpbin.org/stream/5', {
      proxy: {
        url: 'http://127.0.0.1:8080',
        protocol: 'http',
        rejectUnauthorized: false
      },
      stream: {
        onChunk: (chunk) => {
          try {
            const data = JSON.parse(chunk.toString().trim());
            chunkCount++;
            console.log(`\nChunk #${chunkCount}:`);
            console.log('URL:', data.url);
            console.log('Headers:', JSON.stringify(data.headers, null, 2));
          } catch (e) {
            // Ignorar chunks que no son JSON válido (pueden ser parciales)
          }
        },
        onEnd: () => {
          console.log(`\nStreaming completado - Total chunks recibidos: ${chunkCount}`);
        },
        onError: (error) => {
          if (error.message !== 'aborted') { // Ignorar errores de "aborted" que son normales
            console.error('Error en streaming:', error.message);
          }
        }
      }
    });

    // Procesar el stream
    let buffer = '';
    for await (const chunk of stream) {
      buffer += Buffer.from(chunk as Buffer).toString();
      const lines = buffer.split('\n');

      // Procesar todas las líneas completas
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const data = JSON.parse(line);
            console.log('Datos procesados:', data);
          } catch (e) {
            // Ignorar líneas que no son JSON válido
          }
        }
      }

      // Mantener la última línea que podría estar incompleta
      buffer = lines[lines.length - 1];
    }
  } catch (error) {
    console.error('Error en streaming:', error);
  }

  // Probar streaming de un archivo binario
  console.log('\nProbando streaming de archivo binario...');
  try {
    let totalBytes = 0;
    const stream = await http.stream('https://httpbin.org/bytes/1024', {
      proxy: {
        url: 'http://127.0.0.1:8080',
        protocol: 'http',
        rejectUnauthorized: false
      },
      stream: {
        onChunk: (chunk) => {
          totalBytes += chunk.length;
          console.log(`Recibidos ${chunk.length} bytes (Total: ${totalBytes} bytes)`);
        },
        onEnd: () => {
          console.log(`\nDescarga completada - Total bytes: ${totalBytes}`);
        },
        onError: (error) => {
          if (error.message !== 'aborted') { // Ignorar errores de "aborted" que son normales
            console.error('Error en streaming:', error.message);
          }
        }
      }
    });

    // Procesar el stream
    for await (const chunk of stream) {
      // El procesamiento ya se hace en onChunk
    }
  } catch (error) {
    console.error('Error en streaming:', error);
  }
}

// Ejecutar el ejemplo
main().catch(console.error);
