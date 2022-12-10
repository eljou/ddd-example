import { Entity } from '@src/bounded-contexts/shared/domain/entity'
import { NonEmptyString } from '@src/bounded-contexts/shared/domain/value-objects/non-empty-string'
import { PositiveNumber } from '@src/bounded-contexts/shared/domain/value-objects/positive-number'
import { ClientName } from './value-objects/client-name'
import { ReservationId } from './value-objects/reservation-id'

type ReservationPrimitives = {
  id: string
  clientName: string
  seats: number
  date: Date
  accepted: boolean
}

type ReservationProps = {
  clientName: ClientName
  seats: PositiveNumber
  date: Date
  accepted: boolean
}
export class Reservation extends Entity<ReservationProps> {
  private constructor(props: ReservationProps, id?: ReservationId) {
    super(props, id)
  }

  static create(props: ReservationProps & { id?: ReservationId }): Reservation {
    return new Reservation(props, props.id)
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
        clientName: new NonEmptyString(plainData.clientName),
        seats: new PositiveNumber(plainData.seats),
        date: plainData.date,
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
      date: this.props.date,
      accepted: this.props.accepted,
    }
  }
}
