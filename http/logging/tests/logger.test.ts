import { Logger } from "../logger";
import { ConsoleLoggerAdapter } from "../adapters/console.adapter";

describe("Logger", () => {
  it("debería loguear mensajes en consola", () => {
    const logger = Logger.getInstance();
    const adapter = new ConsoleLoggerAdapter();
    logger.configure({ level: "debug", adapters: [adapter] });
    const spy = jest.spyOn(console, "info").mockImplementation(() => {});
    logger.info("Mensaje de prueba", { foo: "bar" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
