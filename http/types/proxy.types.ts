/**
 * Configuración de proxy
 */
export interface ProxyConfig {
  /**
   * URL del proxy
   */
  url: string;

  /**
   * Credenciales del proxy (opcional)
   */
  auth?: {
    username: string;
    password: string;
  };

  /**
   * Protocolo del proxy (http, https, socks)
   * @default 'http'
   */
  protocol?: 'http' | 'https' | 'socks';

  /**
   * Si se debe ignorar el certificado SSL del proxy
   * @default false
   */
  rejectUnauthorized?: boolean;
}
