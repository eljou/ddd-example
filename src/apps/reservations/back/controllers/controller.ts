import * as boom from '@hapi/boom'
import koa from 'koa'

import { JSONType } from '@shared/custom-types'
import { Logger } from '@shared/domain/logger'
import { KoaContex } from '@shared/infrastructure/http-server'
import { makeSafeError } from '@shared/utility-functions'

export abstract class Controller<
  IsPrivate extends boolean,
  ReqBody extends JSONType = Record<string, never>,
  ResBody extends JSONType | unknown = unknown,
> {
  constructor(private logger: Logger) {}

  abstract handle(ctx: KoaContex<IsPrivate, ReqBody, ResBody>): Promise<void>

  async run(ctx: KoaContex<IsPrivate, ReqBody, ResBody>): Promise<void> {
    try {
      await this.handle(ctx)
      this.logger.debug(`-> status: ${ctx.response.status} route: [${ctx.request.method} ${ctx.request.path}]`)
    } catch (error) {
      if (boom.isBoom(error)) throw error

      this.logger.error(`[Controller]: Unknown controller error`)
      this.logger.error(makeSafeError(error))
      this.fail('An unexpected error occurred')
    }
  }

  ok<T>(res: koa.Response, dto?: T): void {
    if (dto) {
      res.set('Accept', 'application/json')
      res.status = 200
      res.body = dto
      return
    }

    res.status = 200
  }

  created(res: koa.Response): void {
    res.status = 201
  }

  unauthorized(message?: string): void {
    throw boom.unauthorized(message)
  }

  badRequest(message: string, metadata?: JSONType): void {
    throw boom.badRequest(message, metadata)
  }

  forbidden(message: string, metadata?: JSONType): void {
    throw boom.forbidden(message, metadata)
  }

  notAcceptable(message: string, metadata?: JSONType): void {
    throw boom.notAcceptable(message, metadata)
  }

  notFound(message: string, metadata?: JSONType): void {
    throw boom.notFound(message, metadata)
  }

  conflict(message: string, metadata?: JSONType): void {
    throw boom.conflict(message, metadata)
  }

  fail(error: Error | string): void {
    throw boom.internal(typeof error == 'string' ? error : error.message)
  }
}
