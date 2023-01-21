import { DomainEvent, EventName } from './domain-event'
import { DomainEventSubscriber } from './domain-event-subscriber'

export interface EventBus {
  publish<E extends EventName>(events: Array<DomainEvent<E>>): Promise<void>
  addSubscribers<E extends EventName>(subscribers: Array<DomainEventSubscriber<DomainEvent<E>>>): void
  onClose(): Promise<void>
}
