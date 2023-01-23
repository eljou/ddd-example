import { ToPrimitives } from '@shared/custom-types'
import { DomainEvent, EventName } from '@shared/domain/domain-event'
import { GenericId } from '@shared/domain/value-objects/id'

import { Reservation } from './reservation'

export class ReservationCreated extends DomainEvent {
  static EVENT_NAME = new EventName('reservation.created')

  static fromPrimitives(primitives: ToPrimitives<ReservationCreated>): ReservationCreated {
    const { aggregateId, eventId, ocurredOn, payload } = primitives
    return new ReservationCreated(
      new GenericId(aggregateId),
      Reservation.fromPrimitives({
        id: payload._id,
        clientName: payload.props.clientName,
        seats: payload.props.seats,
        accepted: payload.props.accepted,
        date: payload.props.date,
      }),
      new GenericId(eventId),
      ocurredOn,
    )
  }

  static create(props: { aggregateId: GenericId; payload: Reservation }): ReservationCreated {
    return new ReservationCreated(props.aggregateId, props.payload)
  }

  constructor(aggregateId: GenericId, public payload: Reservation, eventId?: GenericId, occurredOn?: Date) {
    super(ReservationCreated.EVENT_NAME, aggregateId, eventId, occurredOn)
  }

  toPrimitives(): ToPrimitives<ReservationCreated> {
    return {
      ...super.basePrimitives(),
      payload: {
        _id: this.payload._id.value,
        props: {
          clientName: this.payload.props.clientName.value,
          seats: this.payload.props.seats.value,
          accepted: this.payload.props.accepted,
          date: this.payload.props.date.value,
        },
      },
    }
  }
}
