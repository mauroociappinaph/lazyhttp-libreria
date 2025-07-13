import { formatResource } from '../../../../http/common/utils/format-resource';

describe('formatResource', () => {
  it('debe pluralizar y convertir a minúsculas un nombre en PascalCase', () => {
    expect(formatResource('User')).toBe('users');
    expect(formatResource('Product')).toBe('products');
    expect(formatResource('Category')).toBe('categories');
    expect(formatResource('OrderItem')).toBe('orderitems');
  });

  it('debe devolver el nombre tal cual si ya está en minúsculas y plural', () => {
    expect(formatResource('users')).toBe('users');
    expect(formatResource('products')).toBe('products');
    expect(formatResource('categories')).toBe('categories');
  });

  it('debe devolver el nombre tal cual si ya está en minúsculas y singular pero termina en s', () => {
    expect(formatResource('bus')).toBe('buses');
  });

  it('debe manejar cadenas vacías', () => {
    expect(formatResource('')).toBe('');
  });

  it('debe manejar nombres con espacios (aunque no es un caso RESTful ideal)', () => {
    expect(formatResource('My Item')).toBe('my items');
  });
});
