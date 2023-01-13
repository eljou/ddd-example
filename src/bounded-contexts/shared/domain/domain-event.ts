import { ToPrimitives } from '../custom-types'
import { GenericId } from './value-objects/id'
import { NonEmptyString } from './value-objects/non-empty-string'

export class EventName<V extends string = string> extends NonEmptyString {
  constructor(value: V) {
    super(value)
  }
}

export abstract class DomainEvent<E extends EventName = EventName> {
  readonly aggregateId: GenericId
  readonly eventId: GenericId
  readonly occurredOn: Date
  readonly eventName: E

  constructor(params: { eventName: E; aggregateId: GenericId; eventId?: GenericId; occurredOn?: Date }) {
    const { aggregateId, eventName, eventId, occurredOn } = params
    this.aggregateId = aggregateId
    this.eventName = eventName
    this.eventId = eventId ?? GenericId.generateUnique()
    this.occurredOn = occurredOn ?? new Date()
  }

  protected getBasePrimitives(): ToPrimitives<DomainEvent> {
    return {
      aggregateId: this.aggregateId.value,
      eventId: this.eventId.value,
      eventName: this.eventName.value,
      occurredOn: this.occurredOn,
    }
  }

  abstract toPrimitives(): unknown
}
