import { Reservation } from './reservation'
import { ReservationId } from './value-objects/reservation-id'

export interface ReservationRepository {
  add: (r: Reservation) => Promise<void>
  getById: (id: ReservationId) => Promise<Reservation>
}
