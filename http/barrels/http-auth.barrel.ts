/**
 * Sub-barril para componentes de autenticación
 */

// Funciones de autenticación
export {
  configureAuth as configureAuthHelper,
  login as loginHelper,
  logout as logoutHelper,
  isAuthenticated as isAuthenticatedHelper,
  getAuthenticatedUser as getAuthenticatedUserHelper,
  getAccessToken as getAccessTokenHelper,
  refreshToken as refreshTokenAuthHelper,
  handleRefreshTokenFailure as handleRefreshTokenFailureAuthHelper,
  decodeToken as decodeTokenHelper,
  isTokenExpired as isTokenExpiredHelper,
  storeToken as storeTokenHelper,
  getToken as getTokenHelper,
  removeToken as removeTokenHelper
} from '../http-auth';

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
