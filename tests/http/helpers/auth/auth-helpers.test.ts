import { prepareHeaders, refreshToken, handleRefreshTokenFailure } from '../../../../http/helpers/auth/auth-helpers';

describe('prepareHeaders', () => {
  const originalLocalStorage = global.localStorage;
  let getItemMock: jest.Mock;

  beforeEach(() => {
    // Mock localStorage
    getItemMock = jest.fn();
    (global as typeof globalThis & { localStorage: Storage }).localStorage = { getItem: getItemMock } as never;
  });

  afterAll(() => {
    global.localStorage = originalLocalStorage;
  });

  it('devuelve headers básicos cuando withAuth es false', () => {
    const headers = prepareHeaders({ 'X-Test': '1' }, false);
    expect(headers).toEqual({ 'Content-Type': 'application/json', 'X-Test': '1' });
  });

  it('agrega Authorization si getTokenFn retorna token', () => {
    const headers = prepareHeaders({}, true, () => 'abc123');
    expect(headers['Authorization']).toBe('Bearer abc123');
  });

  it('agrega Authorization si withAuth es true y localStorage tiene token', () => {
    getItemMock.mockReturnValue('tokentest');
    const headers = prepareHeaders({}, true);
    expect(headers['Authorization']).toBe('Bearer tokentest');
  });

  it('no agrega Authorization si no hay token en ningún lado', () => {
    getItemMock.mockReturnValue(null);
    const headers = prepareHeaders({}, true);
    expect(headers['Authorization']).toBeUndefined();
  });
});

describe('refreshToken', () => {
  it('retorna una promesa que resuelve a string vacío', async () => {
    await expect(refreshToken()).resolves.toBe('');
  });
});

describe('handleRefreshTokenFailure', () => {
  it('retorna una promesa que resuelve a undefined', async () => {
    await expect(handleRefreshTokenFailure()).resolves.toBeUndefined();
  });
});
