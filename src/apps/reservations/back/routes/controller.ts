import * as boom from '@hapi/boom'
import koa from 'koa'

import { JSONType } from '@shared/custom-types'

export abstract class Controller {
  abstract handle(req: koa.Request, res: koa.Response): Promise<void>

  async run(ctx: koa.Context): Promise<void> {
    try {
      await this.handle(ctx.request, ctx.response)
    } catch (error) {
      if (boom.isBoom(error)) throw error

      console.log(`[Controller]: Unknown controller error`)
      console.log(error)
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
