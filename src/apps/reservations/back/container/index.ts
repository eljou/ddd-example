import { container } from 'tsyringe'

import { FileReservationRepository } from '@reservations/infrastructure/persistance/file-reservation-repository'
import { WinstonLogger } from '@shared/infrastructure/winston-logger'

import { env } from '../settings'

container
  .register('ReservationRepository', { useClass: FileReservationRepository })
  .registerInstance('Logger', new WinstonLogger(env.LOG_LEVEL))
