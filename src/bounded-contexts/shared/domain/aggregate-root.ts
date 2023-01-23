import { DomainEvent } from './domain-event'
import { Entity } from './entity'

export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent[] = []

  record(event: DomainEvent): void {
    this.domainEvents.push(event)
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents]
    this.domainEvents = []
    return events
  }

  abstract toPrimitives(): unknown
}
