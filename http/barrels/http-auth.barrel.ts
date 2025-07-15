/**
 * Sub-barril para componentes de autenticación
 */

// Funciones de autenticación
import { HttpAuthManager } from '../client/managers/http-auth-manager';

const authManager = new HttpAuthManager();

export const configureAuthHelper = authManager.configureAuth.bind(authManager);
export const loginHelper = authManager.login.bind(authManager);
export const logoutHelper = authManager.logout.bind(authManager);
export const isAuthenticatedHelper = authManager.isAuthenticated.bind(authManager);
export const getAuthenticatedUserHelper = authManager.getAuthenticatedUser.bind(authManager);
export const getAccessTokenHelper = authManager.getAccessToken.bind(authManager);
export const refreshTokenAuthHelper = authManager.refreshToken.bind(authManager);
export const handleRefreshTokenFailureAuthHelper = authManager.handleRefreshTokenFailure.bind(authManager);
export const decodeTokenHelper = authManager.decodeToken.bind(authManager);
export const isTokenExpiredHelper = authManager.isTokenExpired.bind(authManager);
export const storeTokenHelper = authManager.storeToken.bind(authManager);
export const getTokenHelper = authManager.getToken.bind(authManager);
export const removeTokenHelper = authManager.removeToken.bind(authManager);

// Funciones relacionadas en helpers
export {
  refreshToken as refreshTokenHelper,
  handleRefreshTokenFailure as handleRefreshTokenFailureHelper
} from '../http-helpers';

// Tipos relacionados con autenticación
export {
  AuthConfig,
  UserCredentials,
  AuthInfo
} from '../types/auth.types';
