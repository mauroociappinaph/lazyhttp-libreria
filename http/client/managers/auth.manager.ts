
import { AuthInfo, UserCredentials } from '../../common/types';
import { IAuthManager } from '../../common/interfaces/auth.manager.interface';
import { BaseHttpClient } from '../../common/core/base-http-client';

export class AuthManager implements IAuthManager {
  private tokenStorage: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage';

  constructor(private authConfig: any, private client: BaseHttpClient) {}

  async login(credentials: UserCredentials): Promise<AuthInfo> {
    if (!this.authConfig.loginEndpoint) {
      throw new Error('No se ha configurado el endpoint de login');
    }

    try {
      const response = await this.client.post<AuthInfo>(
        this.authConfig.loginEndpoint,
        credentials
      );

      if (response.error || !response.data) {
        throw new Error(response.error || 'Error de autenticación');
      }

      const { token, refreshToken, user } = response.data;

      this._storeToken(this.authConfig.tokenKey || 'token', token);

      if (refreshToken && this.authConfig.refreshTokenKey) {
        this._storeToken(this.authConfig.refreshTokenKey, refreshToken);
      }

      if (user && this.authConfig.userKey) {
        this._storeToken(this.authConfig.userKey, JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (this.authConfig.logoutEndpoint) {
      try {
        await this.client.post(this.authConfig.logoutEndpoint, {}, { withAuth: true });
      } catch (error) {
        // Si falla, continuar con el logout local
      }
    }

    this._removeToken(this.authConfig.tokenKey || 'token');

    if (this.authConfig.refreshTokenKey) {
      this._removeToken(this.authConfig.refreshTokenKey);
    }

    if (this.authConfig.userKey) {
      this._removeToken(this.authConfig.userKey);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = this._decodeToken(token);
      if (decoded && decoded.exp) {
        return !this._isTokenExpired(decoded.exp);
      }
    } catch {
      return false;
    }

    return true;
  }

  getAuthenticatedUser(): any | null {
    if (!this.authConfig.userKey) return null;

    try {
      const userData = this._getToken(this.authConfig.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    return this._getToken(this.authConfig.tokenKey || 'token');
  }

  private _storeToken(key: string, value: string): void {
    const storage = this._getStorage();
    storage.setItem(key, value);
  }

  private _getToken(key: string): string | null {
    const storage = this._getStorage();
    return storage.getItem(key);
  }

  private _removeToken(key: string): void {
    const storage = this._getStorage();
    storage.removeItem(key);
  }

  private _getStorage(): Storage {
    if (this.tokenStorage === 'sessionStorage') {
      return sessionStorage;
    }
    return localStorage;
  }

  private _decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private _isTokenExpired(expiration: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return expiration < currentTime;
  }
}
