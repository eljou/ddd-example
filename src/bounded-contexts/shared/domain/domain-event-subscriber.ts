import { DomainEvent, EventName } from './domain-event'

export interface DomainEventSubscriber<T extends DomainEvent> {
  subscribedTo(): Array<EventName>
  on(domainEvent: T): Promise<void>
}
