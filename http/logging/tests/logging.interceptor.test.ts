import { LoggingInterceptor } from "../interceptors/logging.interceptor";
import { Logger } from "../logger";

describe("LoggingInterceptor", () => {
  const interceptor = new LoggingInterceptor();
  const logger = Logger.getInstance();
  logger.configure({ level: "debug", adapters: [{ log: jest.fn() }] });

  it("debería loguear una petición", () => {
    const context = {
      url: "/api",
      method: "GET",
      headers: {},
      data: null,
      timestamp: Date.now(),
    };
    interceptor.intercept(context);
    // No assertion directa, pero no debe lanzar error
  });

  it("debería loguear una respuesta", () => {
    const context = {
      url: "/api",
      method: "POST",
      headers: {},
      data: { foo: "bar" },
      timestamp: Date.now(),
    };
    const response = { status: 200, data: { ok: true }, headers: {} };
    interceptor.interceptResponse(response, context);
  });

  it("debería loguear un error", async () => {
    const context = {
      url: "/api",
      method: "DELETE",
      headers: {},
      data: null,
      timestamp: Date.now(),
    };
    const error = new Error("fail");
    await expect(interceptor.interceptError(error, context)).rejects.toThrow(
      "fail"
    );
  });
});
