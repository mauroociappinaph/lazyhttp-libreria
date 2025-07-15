import { HttpStreamingManager } from '../../http/http-streaming';
import { Stream } from 'stream';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

// Mockear el módulo de axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: {},
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn(),
  };

  // Declarar mockAxios como any para poder agregar la propiedad create sin error de tipo
  const mockAxios: any = jest.fn(() => mockAxiosInstance);
  mockAxios.create = jest.fn(() => mockAxiosInstance);

  return {
    __esModule: true,
    default: mockAxios,
  };
});

// Ahora, axios es una función mock, así que podemos tiparla directamente
interface MockedAxios extends jest.Mock {
  create: jest.Mock;
}

const mockedAxios = axios as unknown as MockedAxios;

// Mockear las otras dependencias externas
jest.mock('https-proxy-agent');
jest.mock('socks-proxy-agent');

// Tipar los mocks para mejor autocompletado y seguridad
const mockedHttpsProxyAgent = HttpsProxyAgent as any as jest.Mock;
const mockedSocksProxyAgent = SocksProxyAgent as any as jest.Mock;

describe('HttpStreamingManager', () => {
  let streamingManager: HttpStreamingManager;
  let mockStream: Stream.Readable;

  beforeEach(() => {
    // Reiniciar todos los mocks y la instancia antes de cada prueba
    jest.clearAllMocks();
    streamingManager = new HttpStreamingManager();

    // Crear un stream simulado para las pruebas
    mockStream = new Stream.Readable({
      read() {},
    });

    // Configurar el mock de axios para que devuelva el stream simulado
    mockedAxios.mockResolvedValue({ data: mockStream });
  });

  describe('configure', () => {
    it('debería configurar correctamente el baseUrl, timeout y otras opciones', () => {
      const config = {
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        streamConfig: { chunkSize: 4096 },
      };
      streamingManager.configure(config);

      // Para verificar, llamamos a stream y comprobamos la URL construida
      streamingManager.stream('/test');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://api.example.com/test',
        timeout: 5000,
      }));
    });
  });

  describe('stream', () => {
    it('debería lanzar un error si el streaming no está habilitado', async () => {
      await expect(streamingManager.stream('/test', { stream: { enabled: false } }))
        .rejects.toThrow('Streaming no está habilitado para esta petición');
    });

    it('debería llamar a los callbacks onChunk, onEnd y onError correctamente', async () => {
      const onChunk = jest.fn();
      const onEnd = jest.fn();
      const onError = jest.fn();

      await streamingManager.stream('/test', { stream: { onChunk, onEnd, onError } });

      // Simular eventos en el stream
      const testChunk = Buffer.from('datos');
      const testError = new Error('Error de Stream');

      mockStream.emit('data', testChunk);
      expect(onChunk).toHaveBeenCalledWith(testChunk);

      mockStream.emit('error', testError);
      expect(onError).toHaveBeenCalledWith(testError);

      mockStream.emit('end');
      expect(onEnd).toHaveBeenCalled();
    });

    it('debería manejar un error de axios y llamar a onError', async () => {
      const axiosError = new Error('Fallo de red');
      mockedAxios.mockRejectedValue(axiosError);
      const onError = jest.fn();

      await expect(streamingManager.stream('/test', { stream: { onError } }))
        .rejects.toThrow('Fallo de red');

      expect(onError).toHaveBeenCalledWith(axiosError);
    });

    it('debería usar HttpsProxyAgent para proxy http/https', async () => {
      streamingManager.configure({ proxyConfig: { url: 'http://proxy.com:8080', host: 'proxy.com', port: 8080 } });
      await streamingManager.stream('/test');

      expect(mockedHttpsProxyAgent).toHaveBeenCalledWith('http://proxy.com:8080/');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        httpsAgent: expect.any(Object), // La instancia simulada de HttpsProxyAgent
      }));
    });

    it('debería usar SocksProxyAgent para proxy socks', async () => {
      streamingManager.configure({ proxyConfig: { url: 'socks://proxy.com:1080', protocol: 'socks', host: 'proxy.com', port: 1080 } });
      await streamingManager.stream('/test');

      expect(mockedSocksProxyAgent).toHaveBeenCalledWith('socks://proxy.com:1080/');
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        httpsAgent: expect.any(Object), // La instancia simulada de SocksProxyAgent
      }));
    });

    it('debería desactivar la verificación de certificados si rejectUnauthorized es false', async () => {
      const originalEnv = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      streamingManager.configure({ proxyConfig: { url: 'http://proxy.com', rejectUnauthorized: false, host: 'proxy.com', port: 80 } });
      await streamingManager.stream('/test');

      // Debería establecerse en '0' durante la llamada y restaurarse después
      expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBe('1');

      // Restaurar el valor original para no afectar otras pruebas
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalEnv;
    });
  });
});
