import { container } from 'tsyringe'

import { EventBus } from '@shared/domain/event-bus'
import { Logger } from '@shared/domain/logger'
import { CustomRouteBuilder, KoaServer } from '@shared/infrastructure/http-server'

import { NotificationsSubscriber } from './notifications-subscriber'
import { env } from './settings'

export function main(): void {
  const logger = container.resolve<Logger>('Logger')

  const eventBus = container.resolve<EventBus>('EventBus')
  eventBus.addSubscribers([container.resolve(NotificationsSubscriber)])

  KoaServer.create({ productName: 'notifictions', port: env.PORT, logger })
    .registerRoute(
      new CustomRouteBuilder({ isPrivate: false }).get('/ping', async ctx => {
        ctx.response.body = 200
      }),
    )
    .start()
    .then(runningServer => {
      const closeSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGQUIT']
      closeSignals.forEach(s =>
        process.on(s, async () => {
          runningServer.stop()
          await eventBus.onClose()
          logger.info('App closed')
          process.exit(0)
        }),
      )
    })
}
