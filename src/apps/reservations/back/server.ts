import { Server } from 'http'

import { isBoom } from '@hapi/boom'
import koaCors from '@koa/cors'
import c from 'ansi-colors'
import Koa, { Middleware } from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'

import healthRouter from './routes/health'
import reservationsRouter from './routes/reservations'

export class KoaServer {
  private state: 'CREATED' | 'STARTED' | 'BOOTED' | 'CLOSED' = 'CREATED'
  private koaServer: Koa
  private runningServer: Server | null = null
  private globalMiddlewares: Middleware[] = []

  private log(level: 'info' | 'error' | 'debug' | 'warn', msg: string) {
    if (level == 'info') console.log(c.green(` http-server: (${c.bold(c.greenBright(level))}) ${msg}`))
    if (level == 'error') console.error(c.red(` http-server: (${c.bold(c.redBright(level))}) ${msg}`))
    if (level == 'debug') console.debug(c.blue(` http-server: (${c.bold(c.blueBright(level))}) ${msg}`))
    if (level == 'warn') console.warn(c.yellow(` http-server: (${c.bold(c.yellowBright(level))}) ${msg}`))
  }

  private constructor(private productName: string, private port: number) {
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
        if (!isBoom(err)) this.log('warn', 'WARN:: Please use @hapi/boom to generate errors')
        console.error(err)
      })
  }

  static create(productName: string, port: number): KoaServer {
    return new KoaServer(productName, port)
  }

  setGlobalMiddlewares(mids: Middleware[]): this {
    this.globalMiddlewares = [...mids]
    return this
  }

  boot(): Promise<this> {
    this.log('debug', 'Boot started')
    return new Promise(res => {
      const router = new Router()
      router.use(...this.globalMiddlewares)
      router.use(healthRouter.routes())
      router.use(reservationsRouter.routes())
      this.koaServer.use(router.routes()).use(router.allowedMethods())

      this.log(
        'info',
        `Registered server routes:\n  ${router.stack
          .filter(ly => !ly.path.endsWith(')'))
          .map(ly => `[ ${ly.methods.filter(m => m != 'HEAD')} ] - ${ly.path}`)
          .join('\n  ')}`,
      )

      this.log('debug', 'Boot ended')
      this.state = 'BOOTED'
      res(this)
    })
  }

  start(): Promise<this> {
    return new Promise(res => {
      if (this.state != 'BOOTED') throw new Error('App must boot first')

      this.runningServer = this.koaServer.listen(this.port, () => {
        this.state = 'STARTED'
        this.log('info', `${this.productName}: 🚀 API is running on: ${c.bold(`[http(s)://host]:${this.port}`)}`)
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
    this.log('info', `🛌🏾 closed API running on ${c.bold(`[http(s)://host]:${this.port}`)}`)
  }
}
