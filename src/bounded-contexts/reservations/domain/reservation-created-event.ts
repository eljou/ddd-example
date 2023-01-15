import { ToPrimitives } from '@shared/custom-types'
import { DomainEvent, EventName } from '@shared/domain/domain-event'
import { GenericId } from '@shared/domain/value-objects/id'

import { ReservationProps } from './reservation'

export class ReservationCreated extends DomainEvent<EventName<'reservation.created'>> {
  static EVENT_NAME = new EventName('reservation.created')

  readonly attributes: ReservationProps

  constructor(props: { aggregateId: GenericId; attributes: ReservationProps; eventId?: GenericId; occurredOn?: Date }) {
    super({
      eventName: ReservationCreated.EVENT_NAME,
      aggregateId: props.aggregateId,
      eventId: props.eventId,
      occurredOn: props.occurredOn,
    })

    this.attributes = props.attributes
  }

  toPrimitives(): ToPrimitives<ReservationCreated> {
    return {
      ...this.getBasePrimitives(),
      attributes: {
        accepted: this.attributes.accepted,
        clientName: this.attributes.clientName.value,
        date: this.attributes.date.value,
        seats: this.attributes.seats.value,
      },
    }
  }
}
