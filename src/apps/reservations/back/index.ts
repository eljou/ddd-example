import 'reflect-metadata'
import './container'

import { container } from 'tsyringe'

import { Logger } from '@shared/domain/logger'

import { CustomRouteBuilder } from './custom-route'
import { KoaServer } from './server'
import { env } from './settings'

const closeSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGQUIT']

const logger = container.resolve<Logger>('Logger')
KoaServer.create({ productName: 'reservations-backend', port: env.PORT, logger })
  .setGlobalMiddlewares([
    async (ctx, next) => {
      const start = Date.now()
      await next()
      const ms = Date.now() - start
      ctx.set('X-Response-Time', `${ms}ms`)
    },
  ])
  .registerRoute(
    new CustomRouteBuilder<false>({ isPrivate: false }).get('/health', async ctx => {
      ctx.body = null
      ctx.status = 200
    }),
  )
  .registerRoute(
    new CustomRouteBuilder<false>({ isPrivate: false }).get('/ping', async ctx => {
      ctx.body = null
      ctx.status = 200
    }),
  )
  .start()
  .then(server => {
    closeSignals.forEach(s =>
      process.on(s, async () => {
        await server.stop()
        logger.info('App closed')
        process.exit(0)
      }),
    )
  })
  .catch(logger.error)
