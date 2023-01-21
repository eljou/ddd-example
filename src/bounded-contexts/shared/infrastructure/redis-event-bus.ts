import { Redis } from 'ioredis'
import { inject, singleton } from 'tsyringe'

import { DomainEvent, EventName } from '../domain/domain-event'
import { DomainEventSubscriber } from '../domain/domain-event-subscriber'
import { EventBus } from '../domain/event-bus'
import { Logger } from '../domain/logger'

@singleton()
export class RedisEventBus implements EventBus {
  private redis: Redis

  constructor(@inject('Logger') private readonly logger: Logger) {
    this.redis = new Redis({ lazyConnect: true, maxRetriesPerRequest: 5 })
  }

  connect(): Promise<void> {
    return this.redis.connect()
  }

  async publish(events: DomainEvent<EventName>[]): Promise<void> {
    return events
      .reduce(
        (prev, ev) =>
          prev.then(results =>
            this.redis.publish(ev.eventName.value, JSON.stringify(ev.toPrimitives())).then(res => {
              this.logger.debug(`published event: ${ev.eventName.value}`)
              return [...results, res]
            }),
          ),
        Promise.resolve<number[]>([]),
      )
      .then(res => this.logger.debug(`publishing events results: ${res}`))
  }

  addSubscribers<E extends EventName<string>>(subscribers: DomainEventSubscriber<DomainEvent<E, unknown>>[]): void {
    subscribers.forEach(sub => {
      const [eventName, deserializer] = sub.subscribedTo()
      this.redis.subscribe(eventName.value, (err, count) => {
        if (err) throw err
        this.logger.debug(`opened subscriptions :${count}`)
      })

      this.redis.on('message', (channel, msg) => {
        this.logger.silly(`got msg from ${channel}: ${msg}`)
        if (eventName.value == channel) {
          sub.on(deserializer(JSON.parse(msg)))
        }
      })
    })
  }

  async onClose(): Promise<void> {
    this.redis.disconnect()
    this.logger.debug(`disconnected from redis`)
  }
}
