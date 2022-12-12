import { faker } from '@faker-js/faker'
import { PositiveNumberMother } from '@src/bounded-contexts/shared/domain/value-objects/__test__/positive-number-mother'
import { Reservation, ReservationProps } from '../reservation'
import { ClientNameMother } from './client-name-mother'
import { ReservationDateMother } from './reservation-date-mother'

function createReservationProps(props: Partial<ReservationProps> = {}): ReservationProps {
  return {
    clientName: props.clientName ?? ClientNameMother.random(),
    seats: props.seats ?? PositiveNumberMother.random(),
    date: props.date ?? ReservationDateMother.random(),
    accepted: props.accepted ?? faker.datatype.boolean(),
  }
}

export class ReservationMother {
  static random(): Reservation {
    return Reservation.create(createReservationProps())
  }

  static randomWithProps(props: Partial<ReservationProps>): Reservation {
    return Reservation.create(createReservationProps(props))
  }
}
