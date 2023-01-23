import { DomainEvent } from './domain-event'

export interface DomainEventSubscriber<E extends DomainEvent = DomainEvent> {
  subsribedTo(): Array<{
    eventName: typeof DomainEvent.EVENT_NAME
    fromPrimitives: typeof DomainEvent.fromPrimitives
  }>

  on(event: E): Promise<void>
}
