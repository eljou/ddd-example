import { ToPrimitives } from '@shared/custom-types'

import { DomainEvent, EventName } from './domain-event'

export interface DomainEventSubscriber<D extends DomainEvent<E, P>, E extends EventName = EventName, P = unknown> {
  subscribedTo(): [E, (prims: ToPrimitives<D>) => D]
  on(domainEvent: D): Promise<void>
}
