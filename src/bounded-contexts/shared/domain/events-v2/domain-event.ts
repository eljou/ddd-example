import { randomBytes } from 'crypto'
import EventEmitter from 'events'

/* 
type Remap<F extends ((...args: any) => any)[]> = {
  [P in keyof F]: F[P] extends (...a: infer P) => any ? P: never
}

declare const a: [(a: string) => void, (b: number) => void]
type T = Remap<typeof a>
*/

export abstract class DomainEvent {
  static create: (props: { aggregateId: string; eventName: string } & any) => DomainEvent
  static EVENT_NAME: string

  constructor(
    public eventName: typeof DomainEvent.EVENT_NAME,
    public aggregateId: string,
    public eventId: string = randomBytes(16).toString('hex'),
    public ocurredOn: Date = new Date(),
  ) {}
}

type NameRegisteredPayload = { name: string }
class NameRegistered extends DomainEvent {
  static EVENT_NAME = 'name.registered'

  static create(props: { aggregateId: string; payload: NameRegisteredPayload }): NameRegistered {
    return new NameRegistered(props.aggregateId, props.payload)
  }

  private constructor(aggregateId: string, public payload: NameRegisteredPayload) {
    super(NameRegistered.EVENT_NAME, aggregateId)
  }
}

type AgeRegisteredPayload = { age: number }
class AgeRegistered extends DomainEvent {
  static EVENT_NAME = 'age.registered'

  static create(props: { aggregateId: string; payload: AgeRegisteredPayload }): AgeRegistered {
    return new AgeRegistered(props.aggregateId, props.payload)
  }

  private constructor(aggregateId: string, public payload: AgeRegisteredPayload) {
    super(NameRegistered.EVENT_NAME, aggregateId)
  }
}

// ===

interface Subscriber<E extends DomainEvent = DomainEvent> {
  eventMappings(): Array<{ eventName: typeof DomainEvent.EVENT_NAME; eventBuilder: typeof DomainEvent.create }>
  on(event: E): Promise<void>
}

const loggerSubscriber: Subscriber<NameRegistered | AgeRegistered> = {
  eventMappings: () => [
    {
      eventName: NameRegistered.EVENT_NAME,
      eventBuilder: NameRegistered.create,
    },
    {
      eventName: AgeRegistered.EVENT_NAME,
      eventBuilder: AgeRegistered.create,
    },
  ],

  on: async event => {
    console.log(
      `EV >> ${event.eventId}:${event.eventName} = { aggId: ${event.aggregateId}, payload: ${JSON.stringify(
        event.payload,
      )} }`,
    )
  },
}

interface EventBus {
  publish(events: Array<DomainEvent>): Promise<void>
  addSubsribers(subscribers: Array<Subscriber>): void
}

class MemoryEvBus implements EventBus {
  private em = new EventEmitter()

  async publish(events: Array<DomainEvent>): Promise<void> {
    events.forEach(e => {
      console.log('publishing:', e.eventName, JSON.stringify(e))
      this.em.emit(e.eventName, JSON.stringify(e))
    })
  }

  addSubsribers(subscribers: Array<Subscriber<DomainEvent>>): void {
    subscribers.forEach(sub => {
      sub.eventMappings().forEach(mapping => {
        console.log('setup on handler for:', mapping.eventName)
        this.em.on(mapping.eventName, str => {
          const envObj = JSON.parse(str)
          sub.on(mapping.eventBuilder(envObj))
        })
      })
    })
  }
}

async function main() {
  const bus = new MemoryEvBus()
  bus.addSubsribers([loggerSubscriber])

  await bus.publish([NameRegistered.create({ aggregateId: randomBytes(8).toString('hex'), payload: { name: 'Jhon' } })])
  await bus.publish([AgeRegistered.create({ aggregateId: randomBytes(8).toString('hex'), payload: { age: 23 } })])
}

main()
