import { faker } from '@faker-js/faker'
import { ReservationDate } from '../value-objects/reservation-date'

export class ReservationDateMother {
  static random(): ReservationDate {
    return new ReservationDate(faker.date.recent())
  }
}
