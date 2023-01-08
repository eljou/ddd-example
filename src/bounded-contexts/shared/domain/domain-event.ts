import { ToPrimitives } from '../custom-types'
import { GenericId } from './value-objects/id'
import { NonEmptyString } from './value-objects/non-empty-string'

export abstract class DomainEvent<T = unknown> {
  readonly aggregateId: GenericId
  readonly eventId: GenericId
  readonly occurredOn: Date
  readonly eventName: NonEmptyString

  constructor(params: { eventName: NonEmptyString; aggregateId: GenericId; eventId?: GenericId; occurredOn?: Date }) {
    const { aggregateId, eventName, eventId, occurredOn } = params
    this.aggregateId = aggregateId
    this.eventName = eventName
    this.eventId = eventId ?? GenericId.generateUnique()
    this.occurredOn = occurredOn ?? new Date()
  }

  abstract toPrimitives(): ToPrimitives<T>
}
