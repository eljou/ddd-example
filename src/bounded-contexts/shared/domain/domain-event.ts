/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericId } from './value-objects/id'
import { ValueObject } from './value-objects/value-object'
import { ToPrimitives } from '../custom-types'

export class EventName extends ValueObject<string> {}

export abstract class DomainEvent {
  static fromPrimitives: (props: ToPrimitives<DomainEvent> & { payload: any }) => DomainEvent
  static create: (props: { aggregateId: GenericId; eventName: string } & { payload: any }) => DomainEvent
  static EVENT_NAME: EventName

  constructor(
    public eventName: typeof DomainEvent.EVENT_NAME,
    public aggregateId: GenericId,
    public eventId: GenericId = GenericId.generateUnique(),
    public ocurredOn: Date = new Date(),
  ) {}

  abstract toPrimitives(): unknown

  basePrimitives(): ToPrimitives<DomainEvent> {
    return {
      aggregateId: this.aggregateId.value,
      eventId: this.eventId.value,
      eventName: this.eventName.value,
      ocurredOn: this.ocurredOn,
    }
  }
}
