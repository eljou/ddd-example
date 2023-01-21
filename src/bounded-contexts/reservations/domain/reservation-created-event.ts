import { ToPrimitives } from '@shared/custom-types'
import { DomainEvent, EventName } from '@shared/domain/domain-event'
import { GenericId } from '@shared/domain/value-objects/id'
import { PositiveNumber } from '@shared/domain/value-objects/positive-number'

import { ReservationProps } from './reservation'
import { ClientName } from './value-objects/client-name'
import { ReservationDate } from './value-objects/reservation-date'

export class ReservationCreated extends DomainEvent<EventName<'reservation.created'>, ReservationProps> {
  static EVENT_NAME = new EventName('reservation.created')
  static fromPrimitives(prims: ToPrimitives<ReservationCreated>): ReservationCreated {
    return new ReservationCreated({
      aggregateId: new GenericId(prims.aggregateId),
      eventId: new GenericId(prims.eventId),
      occurredOn: prims.occurredOn,
      payload: {
        clientName: new ClientName(prims.payload.clientName),
        seats: new PositiveNumber(prims.payload.seats),
        accepted: prims.payload.accepted,
        date: new ReservationDate(new Date(prims.payload.date)),
      },
    })
  }

  constructor(props: { aggregateId: GenericId; payload: ReservationProps; eventId?: GenericId; occurredOn?: Date }) {
    super({
      eventName: ReservationCreated.EVENT_NAME,
      aggregateId: props.aggregateId,
      eventId: props.eventId,
      occurredOn: props.occurredOn,
      payload: props.payload,
    })
  }

  toPrimitives(): ToPrimitives<ReservationCreated> {
    return {
      ...this.getBasePrimitives(),
      payload: {
        clientName: this.payload.clientName.value,
        seats: this.payload.seats.value,
        accepted: this.payload.accepted,
        date: this.payload.date.value,
      },
    }
  }
}
