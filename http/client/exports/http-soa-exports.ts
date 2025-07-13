import { AxiosInstance } from 'axios';
import { RequestOptions } from '../../http.types';
import { httpInstance } from '../../http-config';
import { prepareHeaders } from '../../http-helpers';

/**
 * Interfaz para la configuración del cliente SOA
 */
export interface SoaClientConfig {
  serviceUrl: string;
  namespace?: string;
  timeout?: number;
  headers?: Record<string, string>;
  axiosInstance?: AxiosInstance;
  withAuth?: boolean;
}

/**
 * Interfaz para la configuración del servidor SOA
 */
export interface SoaServerConfig {
  port?: number;
  services: Record<string, Record<string, (...args: any[]) => Promise<any>>>;
  path?: string;
  cors?: boolean;
}

/**
 * Interfaz para el cliente SOA
 */
export interface SoaClient {
  callService<T = any>(serviceName: string, method: string, params: any, options?: RequestOptions): Promise<T>;
  callBatch<T = any>(calls: Array<{serviceName: string, method: string, params: any}>, options?: RequestOptions): Promise<T[]>;
  getServiceDefinition(serviceName: string): Promise<any>;
  close(): void;
}

/**
 * Interfaz para el servidor SOA
 */
export interface SoaServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  getRegisteredServices(): string[];
  addService(name: string, implementation: Record<string, (...args: any[]) => Promise<any>>): void;
  removeService(name: string): boolean;
}

/**
 * Crea un cliente SOA para consumir servicios remotos
 * @param config Configuración del cliente
 * @returns Cliente SOA
 */
export function createSoaClient(config: SoaClientConfig): SoaClient {
  const {
    serviceUrl,
    namespace = '',
    timeout = 30000,
    headers = {},
    axiosInstance: customAxiosInstance,
    withAuth = false
  } = config;

  // Usar la instancia de axios proporcionada o la predeterminada
  const http = customAxiosInstance || httpInstance;

  // Preparar la URL base con el namespace si existe
  const baseUrl = namespace
    ? `${serviceUrl}/${namespace}`.replace(/\/+$/, '')
    : serviceUrl.replace(/\/+$/, '');

  return {
    /**
     * Llama a un método específico de un servicio
     * @param serviceName Nombre del servicio
     * @param method Nombre del método
     * @param params Parámetros para el método
     * @param options Opciones adicionales de la petición
     * @returns Resultado de la llamada al servicio
     */
    async callService<T>(serviceName: string, method: string, params: any, options: RequestOptions = {}): Promise<T> {
      const url = `${baseUrl}/${serviceName}/${method}`;
      const requestHeaders = prepareHeaders({
        ...headers,
        ...options.headers || {}
      }, withAuth || options.withAuth || false);

      try {
        const response = await http.post(url, params, {
          headers: requestHeaders,
          timeout: options.timeout || timeout
        });

        return response.data;
      } catch (error) {
        // Manejar errores específicos de SOA si es necesario
        console.error(`Error calling service ${serviceName}.${method}:`, error);
        throw error;
      }
    },

    /**
     * Realiza múltiples llamadas a servicios en una sola petición
     * @param calls Array de llamadas a servicios
     * @param options Opciones adicionales de la petición
     * @returns Array con los resultados de cada llamada
     */
    async callBatch<T>(calls: Array<{serviceName: string, method: string, params: any}>, options: RequestOptions = {}): Promise<T[]> {
      const url = `${baseUrl}/batch`;
      const requestHeaders = prepareHeaders({
        ...headers,
        ...options.headers || {}
      }, withAuth || options.withAuth || false);

      try {
        const response = await http.post(url, { calls }, {
          headers: requestHeaders,
          timeout: options.timeout || timeout
        });

        return response.data.results;
      } catch (error) {
        console.error('Error calling batch service:', error);
        throw error;
      }
    },

    /**
     * Obtiene la definición de un servicio
     * @param serviceName Nombre del servicio
     * @returns Definición del servicio (métodos, parámetros, etc.)
     */
    async getServiceDefinition(serviceName: string): Promise<any> {
      const url = `${baseUrl}/${serviceName}/__definition`;
      const requestHeaders = prepareHeaders(headers, withAuth);

      try {
        const response = await http.get(url, {
          headers: requestHeaders,
          timeout
        });

        return response.data;
      } catch (error) {
        console.error(`Error getting service definition for ${serviceName}:`, error);
        throw error;
      }
    },

    /**
     * Cierra el cliente y libera recursos
     */
    close(): void {
      // Limpiar recursos si es necesario
    }
  };
}

/**
 * Crea un servidor SOA para exponer servicios
 * @param config Configuración del servidor
 * @returns Servidor SOA
 */
export function createSoaServer(config: SoaServerConfig): SoaServer {
  const {
    port = 3000,
    services = {},
    path: _path = '/services',
    cors: _cors = true
  } = config;

  // Referencia al servidor (se creará cuando se llame a start())
  let server: any = null;
  const registeredServices = { ...services };
  let isRunning = false;

  return {
    /**
     * Inicia el servidor SOA
     */
    async start(): Promise<void> {
      if (isRunning) {
        console.warn('SOA Server is already running');
        return;
      }

      try {
        // En una implementación real, aquí cargarías express/fastify dinámicamente
        // Para esta implementación de ejemplo, simulamos la creación del servidor
        console.log(`Starting SOA server on port ${port}...`);

        // Simular inicio del servidor
        // En una implementación real:
        // const express = require('express');
        // const app = express();
        // app.use(express.json());
        //
        // if (cors) {
        //   app.use(require('cors')());
        // }
        //
        // Configurar rutas para cada servicio
        // Object.entries(registeredServices).forEach(([serviceName, methods]) => {
        //   app.post(`${path}/${serviceName}/:method`, async (req, res) => {
        //     const { method } = req.params;
        //     if (methods[method]) {
        //       try {
        //         const result = await methods[method](req.body);
        //         res.json(result);
        //       } catch (error) {
        //         res.status(500).json({ error: error.message });
        //       }
        //     } else {
        //       res.status(404).json({ error: `Method ${method} not found` });
        //     }
        //   });
        // });
        //
        // server = app.listen(port);

        // Para este ejemplo, simulamos el servidor
        server = {
          close: (callback: () => void) => {
            console.log('Closing SOA server...');
            callback();
          }
        };

        isRunning = true;
        console.log(`SOA server running on port ${port}`);
      } catch (error) {
        console.error('Failed to start SOA server:', error);
        throw error;
      }
    },

    /**
     * Detiene el servidor SOA
     */
    async stop(): Promise<void> {
      if (!isRunning || !server) {
        console.warn('SOA Server is not running');
        return;
      }

      return new Promise((resolve) => {
        server.close(() => {
          isRunning = false;
          server = null;
          console.log('SOA server stopped');
          resolve();
        });
      });
    },

    /**
     * Obtiene la lista de servicios registrados
     */
    getRegisteredServices(): string[] {
      return Object.keys(registeredServices);
    },

    /**
     * Añade un nuevo servicio al servidor
     * @param name Nombre del servicio
     * @param implementation Implementación del servicio (métodos)
     */
    addService(name: string, implementation: Record<string, (...args: any[]) => Promise<any>>): void {
      if (registeredServices[name]) {
        console.warn(`Service ${name} already exists and will be overwritten`);
      }
      registeredServices[name] = implementation;
    },

    /**
     * Elimina un servicio del servidor
     * @param name Nombre del servicio a eliminar
     * @returns true si el servicio existía y fue eliminado, false en caso contrario
     */
    removeService(name: string): boolean {
      if (registeredServices[name]) {
        delete registeredServices[name];
        return true;
      }
      return false;
    }
  };
}
