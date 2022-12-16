import { JSONType } from '../../custom-types'
import { Logger } from '../logger'

export abstract class CustomError<C extends string> extends Error {
  public issuedAt: Date

  constructor(public code: C, message: string, public metadata: JSONType = {}) {
    super(message)
    this.name = this.constructor.name
    this.issuedAt = new Date()
  }

  toJSON(): JSONType {
    return {
      code: this.code,
      message: this.message,
      issuedAt: this.issuedAt.toISOString(),
      metadata: this.metadata,
    }
  }

  logWith(logger: Logger): void {
    logger.error(`${this.name}: [${this.issuedAt.toISOString()}] ${this.code} - ${this.message}`)
    logger.debug(`${this.name}: ${this.stack}`)
  }
}
