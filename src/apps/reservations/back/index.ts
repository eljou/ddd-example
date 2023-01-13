import 'reflect-metadata'
import './container'

import { container } from 'tsyringe'

import { EventBus } from '@shared/domain/event-bus'
import { Logger } from '@shared/domain/logger'
import { formatBytes } from '@shared/utility-functions'
import { ReservationCreated } from '@src/bounded-contexts/reservations/domain/reservation-created-event'
import { DomainEventSubscriber } from '@src/bounded-contexts/shared/domain/domain-event-subscriber'

import { CustomRouteBuilder } from './custom-route'
import { healthRoute } from './routes/health'
import reservations from './routes/reservations'
import { KoaServer } from './server'
import { env } from './settings'

const closeSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGQUIT']

const logger = container.resolve<Logger>('Logger')

const eventBus = container.resolve<EventBus>('EventBus')

class LogReservationCreatedSubscriber implements DomainEventSubscriber<ReservationCreated> {
  subscribedTo() {
    return [ReservationCreated.EVENT_NAME]
  }

  async on(domainEvent: ReservationCreated): Promise<void> {
    logger.info(`event handled :>> ${JSON.stringify(domainEvent.toPrimitives())}`)
  }
}

eventBus.addSubscribers([new LogReservationCreatedSubscriber()])

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
