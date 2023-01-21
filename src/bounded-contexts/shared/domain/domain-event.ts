import { GenericId } from './value-objects/id'
import { NonEmptyString } from './value-objects/non-empty-string'
import { ToPrimitives } from '../custom-types'

export class EventName<V extends string = string> extends NonEmptyString {
  constructor(value: V) {
    super(value)
  }
}

export abstract class DomainEvent<E extends EventName, P = unknown> {
  static EVENT_NAME: EventName

  readonly aggregateId: GenericId
  readonly eventId: GenericId
  readonly occurredOn: Date
  readonly eventName: E
  readonly payload: P

  constructor(params: { eventName: E; aggregateId: GenericId; eventId?: GenericId; occurredOn?: Date; payload: P }) {
    const { aggregateId, eventName, eventId, occurredOn, payload } = params
    this.aggregateId = aggregateId
    this.eventName = eventName
    this.eventId = eventId ?? GenericId.generateUnique()
    this.occurredOn = occurredOn ?? new Date()
    this.payload = payload
  }

  protected getBasePrimitives(): ToPrimitives<DomainEvent<EventName>> {
    return {
      aggregateId: this.aggregateId.value,
      eventId: this.eventId.value,
      eventName: this.eventName.value,
      occurredOn: this.occurredOn,
      payload: this.payload,
    }
  }

  abstract toPrimitives(): unknown
}
