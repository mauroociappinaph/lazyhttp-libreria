/**
 * Configuración de proxy
 */
export interface ProxyConfig {
  url: string;
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
  protocol?: "http" | "https" | "socks";
  rejectUnauthorized?: boolean;
}
