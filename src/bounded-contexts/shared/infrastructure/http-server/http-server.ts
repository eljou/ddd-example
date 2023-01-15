import { Server } from 'http'

import { badRequest, isBoom } from '@hapi/boom'
import koaCors from '@koa/cors'
import c from 'ansi-colors'
import Koa, { Middleware } from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import { ZodError, ZodType } from 'zod'

import { JSONType } from '../../custom-types'
import { Logger } from '../../domain/logger'
import { CustomRoute } from './custom-route'

export class KoaServer {
  private state: 'CREATED' | 'STARTED' | 'CLOSED' = 'CREATED'
  private koaServer: Koa
  private runningServer: Server | null = null
  private globalMiddlewares: Middleware[] = []
  private router: Router = new Router()

  private constructor(private productName: string, private port: number, private logger: Logger) {
    this.koaServer = new Koa()
    this.koaServer
      .use(bodyParser())
      .use(koaCors())
      .use(async (ctx, next) => {
        try {
          await next()
        } catch (err) {
          if (isBoom(err)) {
            ctx.body =
              err.isServer || err.output.statusCode == 401
                ? err.output.payload.error
                : { ...err.output.payload, ...(err.data ? { data: err.data } : {}) }
          } else ctx.body = `${err}`

          ctx.status = isBoom(err) ? err.output.statusCode : 500

          ctx.app.emit('error', err, ctx)
        }
      })
      .on('error', err => {
        if (!isBoom(err)) this.logger.warn('WARN:: Please use @hapi/boom to generate errors')

        console.error(err)
      })
  }

  static create(options: { productName: string; port: number; logger: Logger }): KoaServer {
    return new KoaServer(options.productName, options.port, options.logger)
  }

  setGlobalMiddlewares(mids: Middleware[]): this {
    this.globalMiddlewares = [...mids]
    return this
  }

  registerRoutesOverPath(path: `/${string}`, routes: CustomRoute<boolean, ZodType | null, JSONType | unknown>[]): this {
    routes
      .map(r => ({
        ...r,
        path: `${path}${r.path.startsWith('/') ? '' : '/'}${r.path}`.replace(/\/*$/, ''),
      }))
      .forEach(r => this.registerRoute(r))
    return this
  }

  registerRoute<
    IsPrivate extends boolean,
    ReqSchem extends ZodType | null = null,
    ResBody extends JSONType | unknown = unknown,
  >(customRoute: CustomRoute<IsPrivate, ReqSchem, ResBody>): this {
    let midds: Router.IMiddleware[] = []
    if (customRoute.isPrivate)
      midds.push(async (ctx, next) => {
        console.log('autenticated')
        ctx.state = {
          userName: 'jhon',
          role: 1,
        }
        await next()
      })

    if (customRoute.bodySchema)
      midds.push(async (ctx, next) => {
        try {
          customRoute.bodySchema.parse(ctx.request.body)
        } catch (error) {
          throw badRequest('Invalid request body', { ...(error as ZodError).flatten().fieldErrors })
        }

        await next()
      })

    if (Array.isArray(customRoute.handler)) {
      midds = [...midds, ...(customRoute.handler as Router.IMiddleware[])]
    } else {
      midds = [...midds, customRoute.handler as Router.IMiddleware]
    }

    this.router[customRoute.method](customRoute.path, ...midds)

    return this
  }

  start(): Promise<this> {
    return new Promise(res => {
      if (this.state != 'CREATED') throw new Error('App must be created')
      this.router.use(...this.globalMiddlewares)
      this.koaServer.use(this.router.routes()).use(this.router.allowedMethods())

      this.logger.info(
        `Registered server routes:\n  ${this.router.stack
          .filter(ly => !ly.path.endsWith(')'))
          .map(ly => `[ ${ly.methods.filter(m => m != 'HEAD')} ] - ${ly.path}`)
          .join('\n  ')}`,
      )

      this.runningServer = this.koaServer.listen(this.port, () => {
        this.state = 'STARTED'
        this.logger.info(`${this.productName}: 🚀 API is running on: ${c.bold(`[http(s)://host]:${this.port}`)}`)
        return res(this)
      })
    })
  }

  getHTTPServer(): Koa {
    return this.koaServer
  }

  async stop(): Promise<void> {
    if (this.runningServer) this.runningServer.close()
    this.state = 'CLOSED'
    this.logger.info(`🛌🏾 closed API running on ${c.bold(`[http(s)://host]:${this.port}`)}`)
  }
}
