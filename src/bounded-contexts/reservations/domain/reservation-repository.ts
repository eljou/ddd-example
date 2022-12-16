import { Criteria } from '@shared/domain/criteria/criteria'

import { Reservation } from './reservation'
import { ReservationId } from './value-objects/reservation-id'

export interface ReservationRepository {
  add: (r: Reservation) => Promise<void>
  getById: (id: ReservationId) => Promise<Reservation | null>
  search: (criteria: Criteria<Reservation>) => Promise<Reservation[]>
}
