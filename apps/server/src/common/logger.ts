import { FastifyInstance } from "fastify";

export function createLogger(app: FastifyInstance) {
  return {
    info: (msg: string) => app.log.info(msg),
    warn: (msg: string) => app.log.warn(msg),
    error: (msg: string) => app.log.error(msg),
  };
}
