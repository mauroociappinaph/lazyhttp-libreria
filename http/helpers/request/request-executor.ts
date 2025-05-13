import axios, { AxiosResponse } from 'axios';
import { HttpMethod, HttpRequestExecutor } from '../../http.types';
import { API_URL } from '../../http-config';
import { logRequest } from '../logging/logger';

/**
 * Implementación del ejecutor de peticiones HTTP
 */
export const requestExecutor: HttpRequestExecutor = {
  /**
   * Ejecuta una petición HTTP
   * @param endpoint URL del endpoint
   * @param method Método HTTP
   * @param headers Cabeceras HTTP
   * @param body Cuerpo de la petición
   * @param signal Señal para abortar la petición
   * @returns Promesa con la respuesta Axios
   */
  async executeRequest<T>(
    endpoint: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body: unknown | undefined,
    signal: AbortSignal
  ): Promise<AxiosResponse<T>> {
    // Comprobar si el endpoint ya es una URL completa
    const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');

    // Usar el endpoint directamente si es una URL completa, o añadir API_URL si es una ruta relativa
    const url = isFullUrl ? endpoint : `${API_URL}${endpoint}`;

    logRequest(method, url, headers, body);

    return axios({
      url,
      method,
      headers,
      data: body,
      withCredentials: true,
      signal,
    });
  }
};
