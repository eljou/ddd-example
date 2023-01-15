import { container } from 'tsyringe'

import { InMemoryAsyncEventBus } from '@shared/infrastructure/in-memory-event-bus'
import { WinstonLogger } from '@shared/infrastructure/winston-logger'
import { EmailNotificatorService } from '@src/bounded-contexts/notifications/infrastructure/email-notificator.service'

import { env } from '../settings'

container
  .register('EventBus', { useClass: InMemoryAsyncEventBus })
  .register('NotificationSenderSvc', { useClass: EmailNotificatorService })
  .registerInstance('Logger', new WinstonLogger(env.LOG_LEVEL))
