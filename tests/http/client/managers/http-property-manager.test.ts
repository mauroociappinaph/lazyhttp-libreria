import { HttpPropertyManager } from '../../../../http/client/managers/http-property-manager';

describe('HttpPropertyManager', () => {
  let propertyManager: HttpPropertyManager;

  beforeEach(() => {
    propertyManager = new HttpPropertyManager();
  });

  test('debería configurar y recuperar propiedades correctamente', () => {
    // Arrange
    const key = 'testProperty';
    const value = { data: 'example' };

    // Act
    propertyManager.setProperty(key, value);
    const retrievedValue = propertyManager.getProperty(key);

    // Assert
    expect(retrievedValue).toEqual(value);
  });

  test('debería devolver undefined para propiedades que no existen', () => {
    // Act
    const value = propertyManager.getProperty('nonExistentProperty');

    // Assert
    expect(value).toBeUndefined();
  });

  test('debería sobrescribir una propiedad existente', () => {
    // Arrange
    const key = 'testProperty';
    const initialValue = 'initial';
    const newValue = 'updated';

    // Act
    propertyManager.setProperty(key, initialValue);
    propertyManager.setProperty(key, newValue);
    const retrievedValue = propertyManager.getProperty(key);

    // Assert
    expect(retrievedValue).toEqual(newValue);
  });

  test('debería verificar correctamente la existencia de una propiedad', () => {
    // Arrange
    const key = 'testProperty';

    // Act & Assert - Propiedad no existe
    expect(propertyManager.hasProperty(key)).toBe(false);

    // Configurar propiedad
    propertyManager.setProperty(key, 'value');

    // Propiedad existe
    expect(propertyManager.hasProperty(key)).toBe(true);
  });

  test('debería eliminar correctamente una propiedad', () => {
    // Arrange
    const key = 'testProperty';
    propertyManager.setProperty(key, 'value');

    // Act
    propertyManager.removeProperty(key);

    // Assert
    expect(propertyManager.hasProperty(key)).toBe(false);
    expect(propertyManager.getProperty(key)).toBeUndefined();
  });

  test('debería limpiar todas las propiedades', () => {
    // Arrange
    propertyManager.setProperty('prop1', 'value1');
    propertyManager.setProperty('prop2', 'value2');

    // Act
    propertyManager.clearProperties();

    // Assert
    expect(propertyManager.hasProperty('prop1')).toBe(false);
    expect(propertyManager.hasProperty('prop2')).toBe(false);
  });
});
