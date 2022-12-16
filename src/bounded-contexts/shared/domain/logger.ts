/* Level priority:
  error: 0,
  warn: 1,
  info: 2,
  debug: 5,
  silly: 6
*/
export type Level = 'error' | 'warn' | 'info' | 'debug' | 'silly'

export interface Logger {
  setLevel(level: Level): void

  debug(message: string, ...meta: unknown[]): void
  error(message: string | Error, ...meta: unknown[]): void
  info(message: string, ...meta: unknown[]): void
  warn(message: string, ...meta: unknown[]): void
  silly(message: string, ...meta: unknown[]): void
}
