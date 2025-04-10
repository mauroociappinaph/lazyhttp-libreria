import { AuthConfig, AuthInfo, AuthResponse, UserCredentials, StorageType } from './http.types';
import { API_URL } from './http-config';
import axios from 'axios';

/**
 * Configuración por defecto de autenticación
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  type: 'jwt',
  endpoints: {
    token: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    userInfo: '/auth/me'
  },
  storage: 'localStorage',
  tokenKeys: {
    accessToken: 'token',
    refreshToken: 'refreshToken'
  },
  autoRefresh: true,
  refreshMargin: 60
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
export let currentAuthConfig: AuthConfig = { ...DEFAULT_AUTH_CONFIG };

/**
 * Configura el sistema de autenticación
 * @param config Configuración personalizada
 */
export function configureAuth(config: Partial<AuthConfig>): void {
  currentAuthConfig = {
    ...DEFAULT_AUTH_CONFIG,
    ...config,
    endpoints: {
      ...DEFAULT_AUTH_CONFIG.endpoints,
      ...config.endpoints
    },
    tokenKeys: {
      ...DEFAULT_AUTH_CONFIG.tokenKeys,
      ...config.tokenKeys
    }
  };

  // Inicializar estado con tokens almacenados
  const accessToken = getToken(currentAuthConfig.tokenKeys.accessToken);
  if (accessToken) {
    const tokenData = decodeToken(accessToken);
    const expiresAt = tokenData?.exp ? tokenData.exp * 1000 : undefined;

    // Solo consideramos válido si no está expirado
    if (!expiresAt || expiresAt > Date.now()) {
      const refreshTokenKey = currentAuthConfig.tokenKeys.refreshToken || '';
      const refreshToken = getToken(refreshTokenKey);

      authState = {
        accessToken,
        refreshToken: refreshToken || undefined,
        expiresAt,
        isAuthenticated: true
      };
    } else {
      // Limpiar tokens expirados
      removeToken(currentAuthConfig.tokenKeys.accessToken);
      if (currentAuthConfig.tokenKeys.refreshToken) {
        removeToken(currentAuthConfig.tokenKeys.refreshToken);
      }
    }
  }
}

/**
 * Inicia sesión con las credenciales proporcionadas
 * @param credentials Credenciales del usuario
 * @returns Información de autenticación
 */
export async function login(credentials: UserCredentials): Promise<AuthInfo> {
  try {
    const endpoint = `${API_URL}${currentAuthConfig.endpoints.token}`;
    const response = await axios.post<AuthResponse>(endpoint, credentials);

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
    storeToken(currentAuthConfig.tokenKeys.accessToken, access_token);
    if (refresh_token && currentAuthConfig.tokenKeys.refreshToken) {
      storeToken(currentAuthConfig.tokenKeys.refreshToken, refresh_token);
    }

    // Actualizar estado
    authState = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
      isAuthenticated: true
    };

    // Cargar información del usuario si está configurado
    if (currentAuthConfig.endpoints.userInfo) {
      try {
        const userResponse = await axios.get(`${API_URL}${currentAuthConfig.endpoints.userInfo}`, {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        });
        authState.user = userResponse.data;
      } catch (error) {
        console.warn('No se pudo cargar la información del usuario');
      }
    }

    return authState;
  } catch (error) {
    // Manejar error de autenticación
    if (currentAuthConfig.onAuthError) {
      currentAuthConfig.onAuthError(error);
    }
    throw error;
  }
}

/**
 * Cierra la sesión actual
 */
export async function logout(): Promise<void> {
  // Llamar al endpoint de logout si está configurado
  if (currentAuthConfig.endpoints.logout && authState.accessToken) {
    try {
      await axios.post(`${API_URL}${currentAuthConfig.endpoints.logout}`, null, {
        headers: {
          Authorization: `Bearer ${authState.accessToken}`
        }
      });
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor', error);
    }
  }

  // Limpiar tokens almacenados
  removeToken(currentAuthConfig.tokenKeys.accessToken);
  if (currentAuthConfig.tokenKeys.refreshToken) {
    removeToken(currentAuthConfig.tokenKeys.refreshToken);
  }

  // Resetear estado
  authState = {
    accessToken: '',
    isAuthenticated: false
  };
}

/**
 * Verifica si el usuario está autenticado
 * @returns `true` si está autenticado, `false` en caso contrario
 */
export function isAuthenticated(): boolean {
  // Verificar si está autenticado y el token no ha expirado
  if (!authState.isAuthenticated || !authState.accessToken) {
    return false;
  }

  // Si hay expiración definida, verificar
  if (authState.expiresAt) {
    return authState.expiresAt > Date.now();
  }

  return true;
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
  if (currentAuthConfig.endpoints.userInfo) {
    try {
      const response = await axios.get(`${API_URL}${currentAuthConfig.endpoints.userInfo}`, {
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
  if (!currentAuthConfig.endpoints.refresh || !authState.refreshToken) {
    throw new Error('No hay configuración para refrescar token');
  }

  try {
    const endpoint = `${API_URL}${currentAuthConfig.endpoints.refresh}`;
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
    storeToken(currentAuthConfig.tokenKeys.accessToken, access_token);
    if (refresh_token && currentAuthConfig.tokenKeys.refreshToken) {
      storeToken(currentAuthConfig.tokenKeys.refreshToken, refresh_token);
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
    if (currentAuthConfig.onAuthError) {
      currentAuthConfig.onAuthError(error);
    }
    throw error;
  }
}

/**
 * Maneja el fallo al refrescar el token
 */
export async function handleRefreshTokenFailure(): Promise<void> {
  // Limpiar tokens almacenados
  removeToken(currentAuthConfig.tokenKeys.accessToken);
  if (currentAuthConfig.tokenKeys.refreshToken) {
    removeToken(currentAuthConfig.tokenKeys.refreshToken);
  }

  // Resetear estado
  authState = {
    accessToken: '',
    isAuthenticated: false
  };

  // Notificar error de autenticación
  if (currentAuthConfig.onAuthError) {
    currentAuthConfig.onAuthError(new Error('Falló el refresco del token'));
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
    const decoded = JSON.parse(atob(payload));

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
  switch (currentAuthConfig.storage) {
    case 'localStorage':
      localStorage.setItem(key, value);
      break;
    case 'sessionStorage':
      sessionStorage.setItem(key, value);
      break;
    case 'secureStorage':
      // Implementación para almacenamiento seguro
      // En un entorno real, se integraría con alguna biblioteca
      // de almacenamiento seguro o encriptación
      localStorage.setItem(`secure_${key}`, value);
      break;
    case 'memory':
      // No hacer nada, ya se guarda en authState
      break;
  }
}

/**
 * Obtiene un token del almacenamiento configurado
 * @param key Clave del token
 * @returns Token almacenado o `null` si no existe
 */
export function getToken(key: string): string | null {
  switch (currentAuthConfig.storage) {
    case 'localStorage':
      return localStorage.getItem(key);
    case 'sessionStorage':
      return sessionStorage.getItem(key);
    case 'secureStorage':
      return localStorage.getItem(`secure_${key}`);
    case 'memory':
      // Para memory, depende del tipo de token
      if (key === currentAuthConfig.tokenKeys.accessToken) {
        return authState.accessToken;
      } else if (key === currentAuthConfig.tokenKeys.refreshToken) {
        return authState.refreshToken || null;
      }
      return null;
  }
  return null;
}

/**
 * Elimina un token del almacenamiento configurado
 * @param key Clave del token
 */
export function removeToken(key: string): void {
  switch (currentAuthConfig.storage) {
    case 'localStorage':
      localStorage.removeItem(key);
      break;
    case 'sessionStorage':
      sessionStorage.removeItem(key);
      break;
    case 'secureStorage':
      localStorage.removeItem(`secure_${key}`);
      break;
    case 'memory':
      // No hacer nada, se limpiará en el estado
      break;
  }
}
