
import { UserCredentials, AuthInfo } from '../types';

export interface IAuthManager {
  login(credentials: UserCredentials): Promise<AuthInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getAuthenticatedUser(): any | null;
  getAccessToken(): string | null;
}
