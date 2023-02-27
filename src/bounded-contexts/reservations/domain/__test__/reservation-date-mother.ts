import { faker } from '@faker-js/faker'

import { ReservationDate } from '../value-objects/reservation-date'

export class ReservationDateMother {
  static random(days?: number): ReservationDate {
    if (days) {
      const dts = new Date()
      dts.setDate(dts.getDate() + days)
      return new ReservationDate(dts)
    }

    const dt = faker.date.soon(10)
    return new ReservationDate(dt)
  }
}
