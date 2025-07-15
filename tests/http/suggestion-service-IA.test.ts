import { SuggestionService } from '../../http/suggestion-service-IA';
import { ErrorInfo } from '../../http/types/error.types';

// Mockear fetch global
global.fetch = jest.fn();

describe('SuggestionService', () => {
  let service: SuggestionService;
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    mockFetch.mockClear();
    service = new SuggestionService('http://test-service.com');
  });

  describe('enable', () => {
    it('debería habilitarse si el servicio responde correctamente', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });
      const enabled = await service.enable();
      expect(enabled).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://test-service.com/suggest', expect.any(Object));
    });

    it('no debería habilitarse si el servicio falla', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const enabled = await service.enable();
      expect(enabled).toBe(false);
    });

    it('no debería habilitarse si fetch lanza un error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const enabled = await service.enable();
      expect(enabled).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Suggestion service not available');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getSuggestion', () => {
    const errorInfo: ErrorInfo & { name: string; status: number } = {
      name: 'HttpTestError',
      status: 500,
      error_type: 'HttpTestError',
      status_code: 500,
    };

    it('debería devolver la sugerencia por defecto si no está habilitado', async () => {
      const suggestion = await service.getSuggestion(errorInfo);
      expect(suggestion).toBe('Verifica tu conexión a internet');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    describe('cuando el servicio está habilitado', () => {
      beforeEach(async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        await service.enable();
        // Limpiar la llamada de enable() para no interferir con las aserciones de la prueba
        mockFetch.mockClear();
      });

      it('debería obtener una sugerencia del servicio', async () => {
        mockFetch.mockResolvedValueOnce({ 
          ok: true, 
          json: () => Promise.resolve({ suggestion: 'Sugerencia de la IA' })
        });

        const suggestion = await service.getSuggestion(errorInfo);
        expect(suggestion).toBe('Sugerencia de la IA');
        expect(mockFetch).toHaveBeenCalledWith('http://test-service.com/suggest', expect.any(Object));
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('debería devolver la sugerencia por defecto si el servicio falla', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false });
        const suggestion = await service.getSuggestion(errorInfo);
        expect(suggestion).toBe('Verifica tu conexión a internet');
      });
    });
  });

  describe('provideFeedback', () => {
    it('no debería hacer nada si no está habilitado', async () => {
      await service.provideFeedback({} as any, undefined, '', true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    describe('cuando el servicio está habilitado', () => {
      beforeEach(async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        await service.enable();
        mockFetch.mockClear();
      });

      it('debería enviar feedback', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });
        await service.provideFeedback({ name: 'E', status: 500, error_type: 'E', status_code: 500 }, undefined, 'sug', true);

        expect(mockFetch).toHaveBeenCalledWith('http://test-service.com/feedback', expect.any(Object));
        const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(callBody.was_helpful).toBe(true);
      });

      it('debería manejar errores de red silenciosamente', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network Error'));
        await expect(service.provideFeedback({} as any, undefined, '', true)).resolves.not.toThrow();
      });
    });
  });
});