import { PositiveNumberMother } from '@shared/domain/value-objects/__test__/positive-number-mother'

import { Reservation, ReservationProps } from '../reservation'
import { ClientNameMother } from './client-name-mother'
import { ReservationDateMother } from './reservation-date-mother'

type CreationProps = Parameters<typeof Reservation.create>[0]

function createReservationProps(props: Partial<ReservationProps> = {}): CreationProps {
  return {
    clientName: props.clientName ?? ClientNameMother.random(),
    seats: props.seats ?? PositiveNumberMother.random(),
    date: props.date ?? ReservationDateMother.random(),
  }
}

export class ReservationMother {
  static random(): Reservation {
    return Reservation.create(createReservationProps())
  }

  static randomWithProps(props: Partial<ReservationProps>): Reservation {
    const res = Reservation.create(createReservationProps(props))
    if (!props.accepted) res.rejectReservation()
    return res
  }
}
