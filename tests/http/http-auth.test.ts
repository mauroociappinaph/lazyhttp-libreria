jest.mock('axios', () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    create: () => ({
      get: jest.fn(),
      post: jest.fn(),
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
    })
  };
});

// Mock de almacenamiento de tokens y localStorage
const tokenStore: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => tokenStore[key] || null,
  setItem: (key: string, value: string) => { tokenStore[key] = value; },
  removeItem: (key: string) => { delete tokenStore[key]; },
  clear: () => { Object.keys(tokenStore).forEach(key => delete tokenStore[key]); },
  key: (index: number) => Object.keys(tokenStore)[index] || null,
  get length() { return Object.keys(tokenStore).length; }
};

import * as httpAuth from '../../http/http-auth';

// Mock de fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const storeToken = (key: string, value: string) => { tokenStore[key] = value; };
const getToken = (key: string) => tokenStore[key] || null;
const removeToken = (key: string) => { delete tokenStore[key]; };

afterEach(() => { Object.keys(tokenStore).forEach(removeToken); jest.clearAllMocks(); });

// Helper para crear un JWT mock válido (sin firma real)
function createMockJwt(payloadObj: object) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(payloadObj));
  return `${header}.${payload}.firma`;
}

describe('http-auth', () => {
  it('login: almacena token y llama onLogin', async () => {
    // Usar JWT válido no expirado
    const token = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const refreshToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) + 7200 });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token, refreshToken }) });
    const onLogin = jest.fn();
    httpAuth.configureAuth({ baseURL: '', loginEndpoint: '/login', onLogin, tokenKey: 'token' });
    await httpAuth.login({ username: 'u', password: 'p' });
    expect(localStorage.getItem('token')).toBe(token);
    expect(onLogin).toHaveBeenCalled();
  });

  it('login: maneja error y llama onError', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    const onError = jest.fn();
    httpAuth.configureAuth({ baseURL: '', loginEndpoint: '/login', onError });
    await expect(httpAuth.login({ username: 'u', password: 'p' })).rejects.toThrow('Login failed');
    expect(onError).toHaveBeenCalled();
  });

  it('logout: elimina token y llama onLogout', async () => {
    storeToken('token', 'abc');
    const onLogout = jest.fn();
    httpAuth.configureAuth({ baseURL: '', logoutEndpoint: '/logout', onLogout });
    (httpAuth as Record<string, unknown>).getToken = getToken;
    (httpAuth as Record<string, unknown>).removeToken = removeToken;
    mockFetch.mockResolvedValueOnce({});
    await httpAuth.logout();
    expect(getToken('token')).toBeNull();
    expect(onLogout).toHaveBeenCalled();
  });

  it('isAuthenticated: true si hay token', () => {
    storeToken('token', 'abc');
    (httpAuth as Record<string, unknown>).getToken = getToken;
    httpAuth.configureAuth({ tokenKey: 'token' });
    expect(httpAuth.isAuthenticated()).toBe(true);
  });

  it('isAuthenticated: false si no hay token', () => {
    (httpAuth as Record<string, unknown>).getToken = getToken;
    httpAuth.configureAuth({ tokenKey: 'token' });
    expect(httpAuth.isAuthenticated()).toBe(false);
  });

  it('getAccessToken: retorna el token si autenticado', () => {
    storeToken('token', 'abc');
    (httpAuth as Record<string, unknown>).getToken = getToken;
    httpAuth.configureAuth({ tokenKey: 'token' });
    expect(httpAuth.getAccessToken()).toBe('abc');
  });

  it('getAccessToken: retorna null si no autenticado', () => {
    (httpAuth as Record<string, unknown>).getToken = getToken;
    httpAuth.configureAuth({ tokenKey: 'token' });
    expect(httpAuth.getAccessToken()).toBeNull();
  });

  it('handleRefreshTokenFailure: limpia tokens y resetea estado', async () => {
    storeToken('token', 'abc');
    storeToken('refresh', 'def');
    httpAuth.configureAuth({ tokenKey: 'token', refreshTokenKey: 'refresh' });
    (httpAuth as Record<string, unknown>).removeToken = removeToken;
    await httpAuth.handleRefreshTokenFailure();
    expect(getToken('token')).toBeNull();
    expect(getToken('refresh')).toBeNull();
  });
});

describe('Casos edge y flujos alternativos', () => {
  it('login: maneja usuario inexistente (404)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({ message: 'User not found' }) });
    const onError = jest.fn();
    httpAuth.configureAuth({ baseURL: '', loginEndpoint: '/login', onError });
    await expect(httpAuth.login({ username: 'noexiste', password: 'p' })).rejects.toThrow('Login failed');
    expect(onError).toHaveBeenCalled();
  });

  it('login: token inválido no autentica', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Token con formato JWT pero payload corrupto (no base64)
    const token = 'header.payload_invalido.firma';
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token }) });
    httpAuth.configureAuth({ baseURL: '', loginEndpoint: '/login', tokenKey: 'token' });
    await expect(httpAuth.login({ username: 'u', password: 'p' })).rejects.toThrow('Token inválido o expirado');
    consoleWarnSpy.mockRestore();
  });

  it('login: token expirado no autentica', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // Token JWT con exp pasado
    const expiredToken = createMockJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ token: expiredToken }) });
    httpAuth.configureAuth({ baseURL: '', loginEndpoint: '/login', tokenKey: 'token' });
    await expect(httpAuth.login({ username: 'u', password: 'p' })).rejects.toThrow('Token inválido o expirado');
    consoleWarnSpy.mockRestore();
  });

  it('refreshToken: éxito actualiza tokens', async () => {
    // Configurar estado y configuración usando helpers públicos
    httpAuth.configureAuth({ refreshEndpoint: '/refresh', tokenKey: 'token', refreshTokenKey: 'refresh' });
    // Setear refreshToken en el estado
    httpAuth.authState.refreshToken = 'refresh';
    httpAuth.authState.isAuthenticated = true;
    jest.spyOn(httpAuth, 'storeToken').mockImplementation(() => {});
    jest.spyOn(httpAuth, 'getToken').mockImplementation(() => 'refresh');
    jest.spyOn(httpAuth, 'removeToken').mockImplementation(() => {});
    jest.spyOn(httpAuth, 'decodeToken').mockImplementation(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    require('axios').post.mockResolvedValueOnce({ data: { access_token: 'nuevo_token', refresh_token: 'nuevo_refresh', expires_in: 3600 } });
    const token = await httpAuth.refreshToken();
    expect(token).toBe('nuevo_token');
  });

  it('refreshToken: error lanza excepción y llama onError', async () => {
    httpAuth.configureAuth({ refreshEndpoint: '/refresh', tokenKey: 'token', refreshTokenKey: 'refresh', onError: jest.fn() });
    httpAuth.authState.refreshToken = 'refresh';
    httpAuth.authState.isAuthenticated = true;
    require('axios').post.mockRejectedValueOnce(new Error('Refresh error'));
    await expect(httpAuth.refreshToken()).rejects.toThrow('Refresh error');
    expect(httpAuth.currentAuthConfig.onError).toHaveBeenCalled();
  });

  it('logout: sin login previo no lanza error y limpia tokens', async () => {
    httpAuth.configureAuth({ logoutEndpoint: '/logout', tokenKey: 'token', onLogout: jest.fn() });
    jest.spyOn(httpAuth, 'getToken').mockImplementation(() => null);
    jest.spyOn(httpAuth, 'removeToken').mockImplementation(() => {});
    await httpAuth.logout();
    expect(httpAuth.currentAuthConfig.onLogout).toHaveBeenCalled();
  });

  it('refreshToken: sin refreshToken lanza error', async () => {
    httpAuth.configureAuth({ refreshEndpoint: '/refresh', tokenKey: 'token', refreshTokenKey: 'refresh' });
    httpAuth.authState.refreshToken = undefined;
    httpAuth.authState.isAuthenticated = true;
    await expect(httpAuth.refreshToken()).rejects.toThrow('No hay configuración para refrescar token');
  });

  it('getAuthenticatedUser: sin autenticación retorna null', async () => {
    httpAuth.authState.accessToken = '';
    httpAuth.authState.isAuthenticated = false;
    expect(await httpAuth.getAuthenticatedUser()).toBeNull();
  });

  it('decodeToken: token corrupto retorna null', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.resetModules();
    const freshHttpAuth = require('../../http/http-auth');
    // Token con payload no base64 (caracteres inválidos)
    expect(freshHttpAuth.decodeToken('header.@@@@@@.firma')).toBeNull();
    consoleWarnSpy.mockRestore();
  });

  it('isTokenExpired: token sin exp retorna false', () => {
    const tokenSinExp = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      btoa(JSON.stringify({})),
      'firma'
    ].join('.');
    expect(httpAuth.isTokenExpired(tokenSinExp)).toBe(false);
  });
});
