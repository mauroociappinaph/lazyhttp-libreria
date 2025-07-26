import { ensureSuccess } from "./ensure-success";

describe("ensureSuccess", () => {
  it("devuelve los datos si no hay error", () => {
    const response = {
      data: { nombre: "Juan" },
      status: 200,
    };
    expect(ensureSuccess(response)).toEqual({ nombre: "Juan" });
  });

  it("lanza excepción enriquecida si hay error", () => {
    const response = {
      data: null,
      error: { message: "No autorizado", code: "AUTH", details: { foo: 1 } },
      status: 401,
    };
    try {
      ensureSuccess(response);
      // Si no lanza, el test debe fallar
      throw new Error("No lanzó excepción");
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(Error);
      if (err && typeof err === "object") {
        expect((err as { message?: string }).message).toBe("No autorizado");
        expect((err as { code?: string }).code).toBe("AUTH");
        expect((err as { details?: unknown }).details).toEqual({ foo: 1 });
        expect((err as { status?: number }).status).toBe(401);
      }
    }
  });
});
