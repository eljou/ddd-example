import { NonEmptyString } from '@src/bounded-contexts/shared/domain/value-objects/non-empty-string'
import { PositiveNumber } from '@src/bounded-contexts/shared/domain/value-objects/positive-number'
import { ReservationId } from './reservation-id'

type ReservationPrimitives = {
  id: string
  clientName: string
  seats: number
  date: Date
  accepted: boolean
}

export class Reservation {
  private constructor(
    private readonly id: ReservationId,
    private readonly clientName: NonEmptyString,
    private readonly seats: PositiveNumber,
    private readonly date: Date,
    private readonly accepted: boolean,
  ) {}

  static create(props: {
    id: ReservationId
    clientName: NonEmptyString
    seats: PositiveNumber
    date: Date
    accepted: boolean
  }): Reservation {
    return new Reservation(props.id, props.clientName, props.seats, props.date, props.accepted)
  }

  static fromPrimitives(plainData: {
    id: string
    clientName: string
    seats: number
    date: Date
    accepted: boolean
  }): Reservation {
    return new Reservation(
      new ReservationId(plainData.id),
      new NonEmptyString(plainData.clientName),
      new PositiveNumber(plainData.seats),
      plainData.date,
      plainData.accepted,
    )
  }

  toPrimitives(): ReservationPrimitives {
    return {
      id: this.id.value,
      clientName: this.clientName.value,
      seats: this.seats.value,
      date: this.date,
      accepted: this.accepted,
    }
  }
}
