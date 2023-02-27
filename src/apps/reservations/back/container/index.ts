import { container } from 'tsyringe'

import { MongodbReservationRepository } from '@reservations/infrastructure/persistance/mongo-reservation-repository'
import { RedisEventBus } from '@shared/infrastructure/redis-event-bus'
import { WinstonLogger } from '@shared/infrastructure/winston-logger'

import { env } from '../settings'

container
  .register('ReservationRepository', { useClass: MongodbReservationRepository })
  .register('EventBus', { useClass: RedisEventBus })
  .registerInstance('Logger', new WinstonLogger(env.LOG_LEVEL))
