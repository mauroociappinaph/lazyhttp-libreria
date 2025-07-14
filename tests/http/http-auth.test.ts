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

describe('http-auth', () => {
  it('login: almacena token y llama onLogin', async () => {
    const token = 'abc';
    const refreshToken = 'def';
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
