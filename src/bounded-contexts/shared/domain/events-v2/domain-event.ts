/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events'

import { ToPrimitives } from '@shared/custom-types'

import { GenericId } from '../value-objects/id'
import { NonEmptyString } from '../value-objects/non-empty-string'
import { ValueObject } from '../value-objects/value-object'

/* 
type Remap<F extends ((...args: any) => any)[]> = {
  [P in keyof F]: F[P] extends (...a: infer P) => any ? P: never
}

declare const a: [(a: string) => void, (b: number) => void]
type T = Remap<typeof a>
*/

class EventName extends ValueObject<string> {}

export abstract class DomainEvent {
  static fromPrimitives: (props: ToPrimitives<DomainEvent> & { payload: any }) => DomainEvent
  static create: (props: { aggregateId: GenericId; eventName: string } & { payload: any }) => DomainEvent
  static EVENT_NAME: EventName

  constructor(
    public eventName: typeof DomainEvent.EVENT_NAME,
    public aggregateId: GenericId,
    public eventId: GenericId = GenericId.generateUnique(),
    public ocurredOn: Date = new Date(),
  ) {}

  basePrimitives(): ToPrimitives<DomainEvent> {
    return {
      aggregateId: this.aggregateId.value,
      eventId: this.eventId.value,
      eventName: this.eventName.value,
      ocurredOn: this.ocurredOn,
    }
  }

  abstract toPrimitives(): unknown
}

type NameRegisteredPayload = { name: NonEmptyString }
class NameRegistered extends DomainEvent {
  static EVENT_NAME = new EventName('name.registered')

  static fromPrimitives(props: ToPrimitives<NameRegistered>): NameRegistered {
    return new NameRegistered(
      new GenericId(props.aggregateId),
      { name: new NonEmptyString(props.payload.name) },
      new GenericId(props.eventId),
      props.ocurredOn,
    )
  }

  static create(props: { aggregateId: GenericId; payload: NameRegisteredPayload }): NameRegistered {
    return new NameRegistered(props.aggregateId, props.payload)
  }

  private constructor(
    aggregateId: GenericId,
    public payload: NameRegisteredPayload,
    eventId?: GenericId,
    ocurredOn?: Date,
  ) {
    super(NameRegistered.EVENT_NAME, aggregateId, eventId, ocurredOn)
  }

  toPrimitives(): ToPrimitives<NameRegistered> {
    return {
      ...super.basePrimitives(),
      payload: {
        name: this.payload.name.value,
      },
    }
  }
}

type AgeRegisteredPayload = { age: number }
class AgeRegistered extends DomainEvent {
  static EVENT_NAME = new EventName('age.registered')

  static fromPrimitives(props: ToPrimitives<AgeRegistered>): AgeRegistered {
    return new AgeRegistered(
      new GenericId(props.aggregateId),
      { age: props.payload.age },
      new GenericId(props.eventId),
      props.ocurredOn,
    )
  }

  static create(props: { aggregateId: GenericId; payload: AgeRegisteredPayload }): AgeRegistered {
    return new AgeRegistered(props.aggregateId, props.payload)
  }

  private constructor(
    aggregateId: GenericId,
    public payload: AgeRegisteredPayload,
    eventId?: GenericId,
    ocurredOn?: Date,
  ) {
    super(AgeRegistered.EVENT_NAME, aggregateId, eventId, ocurredOn)
  }

  toPrimitives(): ToPrimitives<AgeRegistered> {
    return {
      ...super.basePrimitives(),
      payload: {
        age: this.payload.age,
      },
    }
  }
}

// ===

interface Subscriber<E extends DomainEvent = DomainEvent> {
  eventMappings(): Array<{
    eventName: typeof DomainEvent.EVENT_NAME
    fromPrimitives: typeof DomainEvent.fromPrimitives
  }>
  on(event: E): Promise<void>
}

const loggerSubscriber: Subscriber<NameRegistered | AgeRegistered> = {
  eventMappings: () => [
    {
      eventName: NameRegistered.EVENT_NAME,
      fromPrimitives: NameRegistered.fromPrimitives,
    },
    {
      eventName: AgeRegistered.EVENT_NAME,
      fromPrimitives: AgeRegistered.fromPrimitives,
    },
  ],

  on: async event => {
    console.log(`EV >>`, event.toPrimitives())
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
      console.log('publishing:', e.eventName.value, JSON.stringify(e.toPrimitives()))
      this.em.emit(e.eventName.value, JSON.stringify(e.toPrimitives()))
    })
  }

  addSubsribers(subscribers: Array<Subscriber<DomainEvent>>): void {
    subscribers.forEach(sub => {
      sub.eventMappings().forEach(mapping => {
        console.log('setup on handler for:', mapping.eventName)
        this.em.on(mapping.eventName.value, str => {
          const envObj = JSON.parse(str)
          sub.on(mapping.fromPrimitives(envObj))
        })
      })
    })
  }
}

async function main() {
  const bus = new MemoryEvBus()
  bus.addSubsribers([loggerSubscriber])

  const ev1 = NameRegistered.create({
    aggregateId: GenericId.generateUnique(),
    payload: { name: new NonEmptyString('Jhon') },
  })
  const ev2 = AgeRegistered.create({ aggregateId: GenericId.generateUnique(), payload: { age: 23 } })
  console.log(ev1, ev2)
  await bus.publish([ev1, ev2])
}

main()
