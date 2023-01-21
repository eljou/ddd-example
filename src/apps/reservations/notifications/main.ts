import { container } from 'tsyringe'

import { EventName } from '@shared/domain/domain-event'
import { Logger } from '@shared/domain/logger'
import { CustomRouteBuilder, KoaServer } from '@shared/infrastructure/http-server'
import { RedisEventBus } from '@shared/infrastructure/redis-event-bus'

import { NotificationsSubscriber } from './notifications-subscriber'
import { env } from './settings'

export function main(): Promise<void> {
  const logger = container.resolve<Logger>('Logger')

  const eventBus = container.resolve<RedisEventBus>('EventBus')

  return eventBus
    .connect()
    .then(() => {
      const notificationSubs = container.resolve(NotificationsSubscriber)
      eventBus.addSubscribers([notificationSubs as any])

      return KoaServer.create({ productName: 'notifictions', port: env.PORT, logger })
        .registerRoute(
          new CustomRouteBuilder({ isPrivate: false }).get('/ping', async ctx => {
            ctx.response.body = 200
          }),
        )
        .start()
    })
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
