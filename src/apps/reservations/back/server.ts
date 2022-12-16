import { Server } from 'http'

import { isBoom } from '@hapi/boom'
import koaCors from '@koa/cors'
import c from 'ansi-colors'
import Koa, { Middleware } from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'

import { Logger } from '@shared/domain/logger'

import healthRouter from './routes/health'
import reservationsRouter from './routes/reservations'

export class KoaServer {
  private state: 'CREATED' | 'STARTED' | 'BOOTED' | 'CLOSED' = 'CREATED'
  private koaServer: Koa
  private runningServer: Server | null = null
  private globalMiddlewares: Middleware[] = []

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

  boot(): Promise<this> {
    this.logger.debug('Boot started')
    return new Promise(res => {
      const router = new Router()
      router.use(...this.globalMiddlewares)
      router.use(healthRouter.routes())
      router.use(reservationsRouter.routes())
      this.koaServer.use(router.routes()).use(router.allowedMethods())

      this.logger.info(
        `Registered server routes:\n  ${router.stack
          .filter(ly => !ly.path.endsWith(')'))
          .map(ly => `[ ${ly.methods.filter(m => m != 'HEAD')} ] - ${ly.path}`)
          .join('\n  ')}`,
      )

      this.logger.debug('Boot ended')
      this.state = 'BOOTED'
      res(this)
    })
  }

  start(): Promise<this> {
    return new Promise(res => {
      if (this.state != 'BOOTED') throw new Error('App must boot first')

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
