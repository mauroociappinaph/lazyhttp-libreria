/**
 * HttpLazyServer: Servidor HTTP minimalista y fácil de usar para Node.js
 *
 * @module http/server/core/httplazy-server
 */
import express, { Request, Response, Express } from 'express';

/**
 * Servidor HTTP Express minimalista para pruebas y prototipos.
 */
export class HttpLazyServer {
  private app: Express;
  private port: number;

  constructor(options?: { port?: number }) {
    this.app = express();
    this.port = options?.port || 3000;
  }

  get(path: string, handler: (req: Request, res: Response) => void) {
    this.app.get(path, handler);
  }

  post(path: string, handler: (req: Request, res: Response) => void) {
    this.app.post(path, handler);
  }

  use(middleware: any) {
    this.app.use(middleware);
  }

  start(port?: number) {
    const listenPort = port || this.port;
    this.app.listen(listenPort, () => {
      console.log(`Servidor HttpLazy escuchando en puerto ${listenPort}`);
    });
  }
}
