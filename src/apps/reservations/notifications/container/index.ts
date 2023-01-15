import { container } from 'tsyringe'

import { EmailNotificatorService } from '@notifications/infrastructure/email-notificator.service'
import { InMemoryAsyncEventBus } from '@shared/infrastructure/in-memory-event-bus'
import { WinstonLogger } from '@shared/infrastructure/winston-logger'

import { env } from '../settings'

container
  .register('EventBus', { useClass: InMemoryAsyncEventBus })
  .register('NotificationSenderSvc', { useClass: EmailNotificatorService })
  .registerInstance('Logger', new WinstonLogger(env.LOG_LEVEL))
