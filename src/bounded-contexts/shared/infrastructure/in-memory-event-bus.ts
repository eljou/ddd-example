import EventEmitter from 'events'

import { inject, singleton } from 'tsyringe'

import { DomainEvent } from '../domain/domain-event'
import { DomainEventSubscriber } from '../domain/domain-event-subscriber'
import { EventBus } from '../domain/event-bus'
import { Logger } from '../domain/logger'

const eventEmitter = new EventEmitter()

@singleton()
export class InMemoryAsyncEventBus implements EventBus {
  constructor(@inject('Logger') private readonly logger: Logger) {}

  private subscribers: Array<DomainEventSubscriber<DomainEvent>> = []

  async publish(events: DomainEvent[]): Promise<void> {
    events.forEach(event => {
      eventEmitter.emit(event.eventName.value, event)
      this.logger.debug(`published event: ${event.eventName.value}`)
    })
  }

  addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>): void {
    this.subscribers = subscribers

    this.subscribers.forEach(subscriber => {
      const eventName = subscriber.subscribedTo()
      eventEmitter.on(eventName.value, subscriber.on.bind(subscriber))
      this.logger.debug(`subscriber ready on event: ${eventName.value}`)
    })
  }

  async onClose(): Promise<void> {
    this.subscribers.forEach(sub => {
      const event = sub.subscribedTo()
      eventEmitter.removeAllListeners(event.value)
      this.logger.debug(`listener removed for: ${event.value}`)
    })
  }
}
