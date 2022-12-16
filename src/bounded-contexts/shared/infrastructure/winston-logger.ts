import winston, { Logger as WinstonLoggerType } from 'winston'

import { Level, Logger } from '../domain/logger'

export class WinstonLogger implements Logger {
  private logger: WinstonLoggerType
  private transports: { console: winston.transports.ConsoleTransportInstance }

  constructor(private level: Level = 'info') {
    this.transports = {
      console: new winston.transports.Console({
        silent: process.env['NODE_ENV']?.toLowerCase() == 'test' ?? false,
      }),
    }
    this.transports.console.level = this.level

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.prettyPrint(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
      transports: [this.transports.console],
    })
  }

  setLevel(level: Level): void {
    this.transports.console.level = level
  }

  mute(): void {
    this.transports.console.silent = true
  }

  unmute(): void {
    this.transports.console.silent = false
  }

  debug(message: string, ...meta: unknown[]): void {
    this.logger.debug(message, ...meta)
  }

  error(message: string | Error, ...meta: unknown[]): void {
    this.logger.error(typeof message == 'string' ? message : `${message.name}: ${message.message}`, ...meta)
    if (message instanceof Error) this.logger.debug(message.stack)
  }

  info(message: string, ...meta: unknown[]): void {
    this.logger.info(message, ...meta)
  }

  warn(message: string, ...meta: unknown[]): void {
    this.logger.warn(message, ...meta)
  }

  silly(message: string, ...meta: unknown[]): void {
    this.logger.silly(message, ...meta)
  }
}
