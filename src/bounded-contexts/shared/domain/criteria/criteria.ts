import { Entity } from '../entity'
import { OrderType } from '../../custom-types'
import { Filter } from './filter'

export type Order<E extends Entity<unknown>> = { by: keyof E['props']; type: OrderType }

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
