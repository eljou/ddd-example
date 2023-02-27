import { ToPrimitives } from '@shared/custom-types'
import { AggregateRoot } from '@shared/domain/aggregate-root'
import { PositiveNumber } from '@shared/domain/value-objects/positive-number'

import { NoCapacity } from './errors/no-capacity'
import { ReservationCreated } from './reservation-created-event'
import { ClientName } from './value-objects/client-name'
import { ReservationDate } from './value-objects/reservation-date'
import { ReservationId } from './value-objects/reservation-id'

export type ReservationProps = {
  clientName: ClientName
  seats: PositiveNumber
  date: ReservationDate
  accepted: boolean
}

export type ReservationPrimitives = ToPrimitives<ReservationProps> & { id: string }

export class Reservation extends AggregateRoot<ReservationProps> {
  private constructor(props: ReservationProps, id?: ReservationId) {
    super(props, id)
  }

  static create(props: Omit<ReservationProps, 'accepted'> & { id?: ReservationId }): Reservation {
    const res = new Reservation({ ...props, accepted: true }, props.id)
    res.record(ReservationCreated.create({ aggregateId: res._id, payload: res }))
    return res
  }

  static fromPrimitives(plainData: {
    id: string
    clientName: string
    seats: number
    date: Date
    accepted: boolean
  }): Reservation {
    return new Reservation(
      {
        clientName: new ClientName(plainData.clientName),
        seats: new PositiveNumber(plainData.seats),
        date: new ReservationDate(plainData.date),
        accepted: plainData.accepted,
      },
      new ReservationId(plainData.id),
    )
  }

  toPrimitives(): ReservationPrimitives {
    return {
      id: this._id.value,
      clientName: this.props.clientName.value,
      seats: this.props.seats.value,
      date: this.props.date.value,
      accepted: this.props.accepted,
    }
  }

  rejectReservation(): void {
    this.props.accepted = false
  }

  acceptReservation(): void {
    this.props.accepted = true
  }

  tryAcceptReservation(others: Reservation[], capacity: PositiveNumber): void {
    if (others.reduce((acc, r) => acc + r.props.seats.value, 0) + this.props.seats.value > capacity.value)
      throw NoCapacity.create(capacity.value, this.props.seats.value)
  }
}
