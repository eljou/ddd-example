import { Entity } from '../entity'
import { OrderType } from '../../custom-types'

export type Order<E extends Entity<unknown>> = { by: keyof E['props']; type: OrderType }

export type Filter<E extends Entity<unknown>, K extends keyof E['props'] = keyof E['props']> = {
  readonly field: K
  readonly operator: '=' | '!=' | '>' | '<' | 'CONTAINS' | 'NOT_CONTAINS'
  readonly value: E['props'][K]
}

export class Criteria<E extends Entity<unknown>> {
  constructor(
    readonly props: {
      filters: Filter<E>[]
      order?: Order<E>
      limit?: number
      offset?: number
    },
  ) {}
}
