import { AuthConfig, AuthInfo, AuthResponse, CookieOptions } from './types/auth.types';
import { API_URL } from './http-config';
import axios from 'axios';
import { CookieManager } from './cookie-manager';

/**
 * Configuración por defecto de autenticación
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  baseURL: '',
  loginEndpoint: '/auth/login',
  logoutEndpoint: '/auth/logout',
  userInfoEndpoint: '/auth/me',
  refreshEndpoint: '/auth/refresh',
  tokenKey: 'token',
  refreshTokenKey: 'refreshToken',
  storage: 'localStorage'
};

/**
 * Estado actual de autenticación
 */
export let authState: AuthInfo = {
  accessToken: '',
  isAuthenticated: false
};

/**
 * Configuración actual de autenticación
 */
export let currentAuthConfig: AuthConfig = {
  baseURL: '',
  loginEndpoint: '/login',
  logoutEndpoint: '/logout',
  tokenKey: 'token',
  refreshTokenKey: 'refreshToken',
  storage: 'localStorage'
};

/**
 * Configura el sistema de autenticación
 * @param config Configuración personalizada
 */
export function configureAuth(config: Partial<AuthConfig>): void {
  currentAuthConfig = {
    ...currentAuthConfig,
    ...config
  };

  // Inicializar estado con tokens almacenados
  const accessToken = getToken(currentAuthConfig.tokenKey);
  if (accessToken) {
    const tokenData = decodeToken(accessToken);
    const expiresAt = tokenData?.exp ? tokenData.exp * 1000 : undefined;

    // Solo consideramos válido si no está expirado
    if (!expiresAt || expiresAt > Date.now()) {
      const refreshTokenKey = currentAuthConfig.refreshTokenKey || '';
      const refreshToken = getToken(refreshTokenKey);

      authState = {
        accessToken,
        refreshToken: refreshToken || undefined,
        expiresAt,
        isAuthenticated: true
      };
    } else {
      // Limpiar tokens expirados
      removeToken(currentAuthConfig.tokenKey);
      if (currentAuthConfig.refreshTokenKey) {
        removeToken(currentAuthConfig.refreshTokenKey);
      }
    }
  }
}

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param credentials Credenciales del usuario
 * @returns Información de autenticación
 */
export async function login(credentials: { username: string; password: string }): Promise<AuthResponse> {
  try {
    const response = await fetch(`${currentAuthConfig.baseURL}${currentAuthConfig.loginEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    storeToken(currentAuthConfig.tokenKey, data.token);
    if (currentAuthConfig.refreshTokenKey) {
      storeToken(currentAuthConfig.refreshTokenKey, data.refreshToken);
    }

    // Validar token recibido
    const tokenData = decodeToken(data.token);
    if (!tokenData || isTokenExpired(data.token)) {
      removeToken(currentAuthConfig.tokenKey);
      if (currentAuthConfig.refreshTokenKey) {
        removeToken(currentAuthConfig.refreshTokenKey);
      }
      throw new Error('Token inválido o expirado');
    }

    if (currentAuthConfig.onLogin) {
      currentAuthConfig.onLogin(data);
    }

    return data;
  } catch (error) {
    if (currentAuthConfig.onError) {
      currentAuthConfig.onError(error);
    }
    throw error;
  }
}

/**
 * Cierra la sesión actual
 */
export async function logout(): Promise<void> {
  try {
    const token = getToken(currentAuthConfig.tokenKey);
    if (token) {
      await fetch(`${currentAuthConfig.baseURL}${currentAuthConfig.logoutEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    if (currentAuthConfig.onError) {
      currentAuthConfig.onError(error);
    }
  } finally {
    removeToken(currentAuthConfig.tokenKey);
    if (currentAuthConfig.onLogout) {
      currentAuthConfig.onLogout();
    }
  }
}

/**
 * Verifica si el usuario está autenticado
 * @returns `true` si está autenticado, `false` en caso contrario
 */
export function isAuthenticated(): boolean {
  return !!getToken(currentAuthConfig.tokenKey);
}

/**
 * Obtiene la información del usuario autenticado
 * @returns Información del usuario o `null` si no está autenticado
 */
export async function getAuthenticatedUser(): Promise<any | null> {
  if (!isAuthenticated()) {
    return null;
  }

  // Si ya tenemos la información del usuario, devolverla
  if (authState.user) {
    return authState.user;
  }

  // Si no, intentar cargarla
  if (currentAuthConfig.userInfoEndpoint) {
    try {
      const response = await axios.get(`${API_URL}${currentAuthConfig.userInfoEndpoint}`, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`
        }
      });
      authState.user = response.data;
      return authState.user;
    } catch (error) {
      console.warn('No se pudo cargar la información del usuario');
      return null;
    }
  }

  return null;
}

/**
 * Obtiene el token de acceso actual
 * @returns Token de acceso o `null` si no está autenticado
 */
export function getAccessToken(): string | null {
  if (!isAuthenticated()) {
    return null;
  }
  return authState.accessToken;
}

/**
 * Refresca el token de autenticación
 * @returns El nuevo token de autenticación
 */
export async function refreshToken(): Promise<string> {
  if (!currentAuthConfig.refreshEndpoint || !authState.refreshToken) {
    throw new Error('No hay configuración para refrescar token');
  }

  try {
    const endpoint = `${API_URL}${currentAuthConfig.refreshEndpoint}`;
    const response = await axios.post<AuthResponse>(endpoint, {
      refresh_token: authState.refreshToken
    });

    if (!response.data.access_token) {
      throw new Error('No se recibió un token de acceso');
    }

    // Extraer datos de la respuesta
    const { access_token, refresh_token, expires_in } = response.data;

    // Calcular tiempo de expiración
    const expiresAt = expires_in
      ? Date.now() + (expires_in * 1000)
      : undefined;

    // Almacenar tokens
    storeToken(currentAuthConfig.tokenKey, access_token);
    if (refresh_token && currentAuthConfig.refreshTokenKey) {
      storeToken(currentAuthConfig.refreshTokenKey, refresh_token);
    }

    // Actualizar estado
    authState = {
      ...authState,
      accessToken: access_token,
      refreshToken: refresh_token || authState.refreshToken,
      expiresAt,
      isAuthenticated: true
    };

    return access_token;
  } catch (error) {
    // Manejar error de refresco
    if (currentAuthConfig.onError) {
      currentAuthConfig.onError(error);
    }
    throw error;
  }
}

/**
 * Maneja el fallo al refrescar el token
 */
export async function handleRefreshTokenFailure(): Promise<void> {
  // Limpiar tokens almacenados
  removeToken(currentAuthConfig.tokenKey);
  if (currentAuthConfig.refreshTokenKey) {
    removeToken(currentAuthConfig.refreshTokenKey);
  }

  // Resetear estado
  authState = {
    accessToken: '',
    isAuthenticated: false
  };

  // Notificar error de autenticación
  if (currentAuthConfig.onError) {
    currentAuthConfig.onError(new Error('Falló el refresco del token'));
  }
}

/**
 * Decodifica un token JWT
 * @param token Token JWT
 * @returns Payload del token decodificado
 */
export function decodeToken(token: string): any {
  try {
    // Dividir el token en sus partes
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar la parte del payload (segunda parte)
    const payload = parts[1];
    const decodedStr = atob(payload);
    const decoded = JSON.parse(decodedStr);
    if (typeof decoded !== 'object' || decoded === null) {
      return null;
    }
    return decoded;
  } catch (error) {
    console.warn('Error al decodificar token', error);
    return null;
  }
}

/**
 * Verifica si un token está expirado
 * @param token Token a verificar o timestamp de expiración
 * @returns `true` si está expirado, `false` en caso contrario
 */
export function isTokenExpired(token: string | number): boolean {
  if (typeof token === 'number') {
    return token < Date.now();
  }

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return false;
  }

  const expiresAt = decoded.exp * 1000; // Convertir a milisegundos
  return expiresAt < Date.now();
}

/**
 * Almacena un token en el almacenamiento configurado
 * @param key Clave del token
 * @param value Valor del token
 */
export function storeToken(key: string, value: string): void {
  const cookieOptions: CookieOptions = {
    ...currentAuthConfig.cookieOptions,
    path: '/'
  };

  switch (currentAuthConfig.storage) {
    case 'cookie':
      CookieManager.set(key, value, cookieOptions);
      break;
    case 'localStorage':
      localStorage.setItem(key, value);
      break;
    case 'sessionStorage':
      sessionStorage.setItem(key, value);
      break;
  }
}

/**
 * Obtiene un token del almacenamiento configurado
 * @param key Clave del token
 * @returns Valor del token o null si no existe
 */
export function getToken(key: string): string | null {
  switch (currentAuthConfig.storage) {
    case 'cookie':
      return CookieManager.get(key);
    case 'localStorage':
      return localStorage.getItem(key);
    case 'sessionStorage':
      return sessionStorage.getItem(key);
    default:
      return null;
  }
}

/**
 * Elimina un token del almacenamiento configurado
 * @param key Clave del token
 */
export function removeToken(key: string): void {
  switch (currentAuthConfig.storage) {
    case 'cookie':
      CookieManager.remove(key, currentAuthConfig.cookieOptions);
      break;
    case 'localStorage':
      localStorage.removeItem(key);
      break;
    case 'sessionStorage':
      sessionStorage.removeItem(key);
      break;
  }
}
