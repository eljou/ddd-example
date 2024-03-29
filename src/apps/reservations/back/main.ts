import typedMongo from 'ts-valid-mongodb'
import { container } from 'tsyringe'

import { Logger } from '@shared/domain/logger'
import { CustomRouteBuilder, KoaServer } from '@shared/infrastructure/http-server'
import { RedisEventBus } from '@shared/infrastructure/redis-event-bus'
import { formatBytes } from '@shared/utility-functions'

import { healthRoute } from './routes/health'
import reservations from './routes/reservations'
import { env } from './settings'

export function main(): Promise<void> {
  const logger = container.resolve<Logger>('Logger')
  const eventBus = container.resolve<RedisEventBus>('EventBus')

  return typedMongo
    .connect('mongodb://localhost:27017', 'reservations')
    .then(() => eventBus.connect())
    .then(() =>
      KoaServer.create({ productName: 'reservations-backend', port: env.PORT, logger })
        .setGlobalMiddlewares([
          async (ctx, next) => {
            if (ctx.method + ctx.path == 'GET/health') return await next()

            try {
              logger.silly(`<-- ${ctx.method} ${ctx.path} [ ${new Date().toLocaleString()} ]`)
              await next()
            } finally {
              logger.silly(
                `--> ${ctx.method} ${ctx.path} [ ${new Date().toLocaleString()} ] ${ctx.status} ${
                  ctx.response.headers['x-response-time']
                } ${formatBytes(ctx.response.length ?? 0)}`,
              )
            }
          },
          async (ctx, next) => {
            const start = Date.now()
            await next()
            const ms = Date.now() - start
            ctx.set('X-Response-Time', `${ms}ms`)
          },
        ])
        .registerRoute(
          new CustomRouteBuilder<false>({ isPrivate: false }).get('/ping', async ctx => {
            ctx.status = 200
          }),
        )
        .registerRoute(healthRoute)
        .registerRoutesOverPath('/reservation', reservations)
        .start(),
    )
    .then(server => {
      const closeSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGQUIT']
      closeSignals.forEach(s =>
        process.on(s, async () => {
          await eventBus.onClose()
          await server.stop()
          await typedMongo.disconnect()
          logger.info('App closed')
          process.exit(0)
        }),
      )
    })
    .catch(console.error)
}
