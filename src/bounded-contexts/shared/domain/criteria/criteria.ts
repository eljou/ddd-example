import { Entity } from '../entity'
import { OrderType } from '../../custom-types'
import { Filter } from './filter'

export type Order<E extends Entity<unknown>> = { by: keyof E['props']; type: OrderType }

export class Criteria<E extends Entity<unknown>> {
  readonly filters: Filter<E>[]
  readonly order?: Order<E>
  readonly limit?: number
  readonly offset?: number

  constructor(props: { filters: Filter<E>[]; order?: Order<E>; limit?: number; offset?: number }) {
    this.filters = props.filters
    this.order = props.order
    this.limit = props.limit
    this.offset = props.offset
  }
}