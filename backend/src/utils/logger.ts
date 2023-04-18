import pino from "pino";

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      levelFirst: true,
      // translateTime: true,
      translateTime: 'dd/mm/yyyy HH:MM:ss',
      colorize: true,
      ignore: "pid,hostname",
      // include: 'level,time',
      // mkdir: true, // create the target destination
    }
  }
});

export { logger };
