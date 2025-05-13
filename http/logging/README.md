# Sistema de Logging para HTTPLazy

Este módulo provee un sistema de logging modular, extensible y desacoplado para registrar información de peticiones y respuestas HTTP.

## Características

- Adaptadores pluggables (consola, archivo, servicios externos)
- Niveles de log: debug, info, warn, error
- Integración como interceptor HTTP
- Contratos tipados y configurables

## Estructura

```
/logging
  logger.ts
  adapters/
    console.adapter.ts
  interceptors/
    logging.interceptor.ts
  types/
    logger.http-interface.ts
```

## Uso Básico

```ts
import { Logger, ConsoleLoggerAdapter } from "@/http/logging";

const logger = Logger.getInstance();
logger.configure({
  level: "debug",
  adapters: [new ConsoleLoggerAdapter()],
});

logger.info("Mensaje informativo", { userId: 123 });
```

## Como Interceptor HTTP

```ts
import { LoggingInterceptor } from "@/http/logging";

client.useInterceptor(new LoggingInterceptor());
```

## Extensión

Puedes crear nuevos adaptadores implementando `ILoggerAdapter`.
