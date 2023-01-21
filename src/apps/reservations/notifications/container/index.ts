import { container } from 'tsyringe'

import { EmailNotificatorService } from '@notifications/infrastructure/email-notificator.service'
import { RedisEventBus } from '@shared/infrastructure/redis-event-bus'
import { WinstonLogger } from '@shared/infrastructure/winston-logger'

import { env } from '../settings'

container
  .register('EventBus', { useClass: RedisEventBus })
  .register('NotificationSenderSvc', { useClass: EmailNotificatorService })
  .registerInstance('Logger', new WinstonLogger(env.LOG_LEVEL))
