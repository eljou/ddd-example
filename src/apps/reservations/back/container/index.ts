import { container } from 'tsyringe'

import { FileReservationRepository } from '@src/bounded-contexts/reservations/infrastructure/persistance/file-reservation-repository'
container.register('ReservationRepository', { useClass: FileReservationRepository })
