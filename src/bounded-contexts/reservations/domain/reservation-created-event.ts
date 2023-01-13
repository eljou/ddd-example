import { DomainEvent, EventName } from '@shared/domain/domain-event'
import { ToPrimitives } from '@src/bounded-contexts/shared/custom-types'
import { GenericId } from '@src/bounded-contexts/shared/domain/value-objects/id'
import { NonEmptyString } from '@src/bounded-contexts/shared/domain/value-objects/non-empty-string'
import { PositiveNumber } from '@src/bounded-contexts/shared/domain/value-objects/positive-number'

import { ReservationProps } from './reservation'
import { ClientName } from './value-objects/client-name'
import { ReservationDate } from './value-objects/reservation-date'

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
