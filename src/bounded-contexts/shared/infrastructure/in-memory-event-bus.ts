import EventEmitter from 'events'

import { singleton } from 'tsyringe'

import { DomainEvent } from '../domain/domain-event'
import { DomainEventSubscriber } from '../domain/domain-event-subscriber'
import { EventBus } from '../domain/event-bus'

const eventEmitter = new EventEmitter()

@singleton()
export class InMemoryAsyncEventBus implements EventBus {
  async publish(events: DomainEvent[]): Promise<void> {
    events.forEach(event => {
      eventEmitter.emit(event.eventName.value, event)
    })
  }

  addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>): void {
    subscribers.forEach(subscriber => {
      subscriber.subscribedTo().forEach(eventName => {
        eventEmitter.on(eventName.value, subscriber.on.bind(subscriber))
      })
    })
  }
}
