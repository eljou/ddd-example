import { Redis, RedisOptions } from 'ioredis'
import { inject, singleton } from 'tsyringe'

import { DomainEvent } from '../domain/domain-event'
import { DomainEventSubscriber } from '../domain/domain-event-subscriber'
import { EventBus } from '../domain/event-bus'
import { Logger } from '../domain/logger'

@singleton()
export class RedisEventBus implements EventBus {
  private emitter: Redis
  private listener: Redis
  private subscribersMap: Map<
    string,
    Array<{
      eventBuilder: typeof DomainEvent.fromPrimitives
      handler: DomainEventSubscriber['on']
    }>
  >

  constructor(@inject('Logger') private readonly logger: Logger) {
    this.subscribersMap = new Map()

    const options: RedisOptions = { lazyConnect: true, maxRetriesPerRequest: 5 }
    this.emitter = new Redis(options)
    this.listener = new Redis(options)
  }

  private async subscribeToTopic(topic: string): Promise<void> {
    return new Promise((res, rej) => this.listener.subscribe(topic, err => (err ? rej(err) : res())))
  }

  async connect(): Promise<void> {
    await this.emitter.connect()
    await this.listener.connect()

    const res = await Promise.all([...this.subscribersMap.keys()].map(topic => this.subscribeToTopic(topic)))
    this.logger.debug(`opened subscriptions :${res.length}`)

    this.listener.on('message', async (channel, msg) => {
      this.logger.silly(`got msg from ${channel}: ${msg}`)

      const subscribers = this.subscribersMap.get(channel)
      if (subscribers) {
        for (const sub of subscribers) {
          await sub.handler(sub.eventBuilder(JSON.parse(msg)))
        }
      }
    })
  }

  publish(events: Array<DomainEvent>): Promise<void> {
    return events
      .reduce(
        (prev, ev) =>
          prev.then(results =>
            this.emitter.publish(ev.eventName.value, JSON.stringify(ev.toPrimitives())).then(res => {
              this.logger.debug(`published event: ${ev.eventName.value}`)
              return [...results, res]
            }),
          ),
        Promise.resolve<number[]>([]),
      )
      .then(res => this.logger.debug(`publishing events results: ${res}`))
  }

  addSubscribers(subscribers: DomainEventSubscriber<DomainEvent>[]): void {
    this.subscribersMap = subscribers.reduce<typeof this.subscribersMap>((eventSubscribersMap, subscriber) => {
      subscriber.subsribedTo().forEach(({ eventName, fromPrimitives }) => {
        if (!eventSubscribersMap.has(eventName.value))
          eventSubscribersMap.set(eventName.value, [
            { eventBuilder: fromPrimitives, handler: subscriber.on.bind(subscriber) },
          ])
        else {
          const subcribersForEvent = eventSubscribersMap.get(eventName.value) ?? []
          eventSubscribersMap.set(eventName.value, [
            ...subcribersForEvent,
            { eventBuilder: fromPrimitives, handler: subscriber.on.bind(subscriber) },
          ])
        }
      })

      return eventSubscribersMap
    }, new Map())
  }

  async onClose(): Promise<void> {
    this.listener.disconnect()
    this.emitter.disconnect()
    this.logger.debug(`disconnected from redis`)
  }
}
