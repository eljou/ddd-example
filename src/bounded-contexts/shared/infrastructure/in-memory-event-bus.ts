import EventEmitter from 'events'

import { inject, singleton } from 'tsyringe'

import { DomainEvent } from '../domain/domain-event'
import { DomainEventSubscriber } from '../domain/domain-event-subscriber'
import { EventBus } from '../domain/event-bus'
import { Logger } from '../domain/logger'

const eventEmitter = new EventEmitter()

@singleton()
export class InMemoryAsyncEventBus implements EventBus {
  private subscribers: Array<DomainEventSubscriber<DomainEvent>> = []

  constructor(@inject('Logger') private readonly logger: Logger) {}

  async publish(events: Array<DomainEvent>): Promise<void> {
    events.forEach(e => {
      this.logger.debug(`publishing: ${e.eventName.value}`)
      eventEmitter.emit(e.eventName.value, JSON.stringify(e.toPrimitives()))
    })
  }

  addSubscribers(subscribers: Array<DomainEventSubscriber<DomainEvent>>): void {
    this.subscribers = [...subscribers]

    subscribers.forEach(sub => {
      sub.subsribedTo().forEach(({ eventName, fromPrimitives }) => {
        this.logger.info(`setup on handler for: ${eventName.value}`)

        eventEmitter.on(eventName.value, str => {
          const envObj = JSON.parse(str)
          sub.on(fromPrimitives(envObj))
        })
      })
    })
  }

  async onClose(): Promise<void> {
    this.subscribers.forEach(sub => {
      sub.subsribedTo().forEach(({ eventName }) => {
        eventEmitter.removeAllListeners(eventName.value)
        this.logger.debug(`listener removed for: ${eventName.value}`)
      })
    })
  }
}
