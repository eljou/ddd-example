import { container } from 'tsyringe'

import { FileReservationRepository } from '@reservations/infrastructure/persistance/file-reservation-repository'
import { InMemoryAsyncEventBus } from '@shared/infrastructure/in-memory-event-bus'
import { WinstonLogger } from '@shared/infrastructure/winston-logger'

import { env } from '../settings'

container
  .register('ReservationRepository', { useClass: FileReservationRepository })
  .register('EventBus', { useClass: InMemoryAsyncEventBus })
  .registerInstance('Logger', new WinstonLogger(env.LOG_LEVEL))
