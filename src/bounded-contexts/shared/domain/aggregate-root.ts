import { DomainEvent, EventName } from './domain-event'
import { Entity } from './entity'

export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent<EventName>[] = []

  record(event: DomainEvent<EventName>): void {
    this.domainEvents.push(event)
  }

  pullDomainEvents(): DomainEvent<EventName>[] {
    const events = [...this.domainEvents]
    this.domainEvents = []
    return events
  }

  abstract toPrimitives(): unknown
}
