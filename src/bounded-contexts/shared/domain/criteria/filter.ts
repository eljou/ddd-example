import { Entity } from '../entity'

type Operator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'CONTAINS' | 'NOT_CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH'
// | 'IN'
// | 'NOT_IN'

export class Filter<E extends Entity<unknown>> {
  private constructor(
    readonly field: keyof E['props'],
    readonly operator: Operator,
    readonly value: E['props'][keyof E['props']],
  ) {}

  static create<E extends Entity<unknown>>(props: {
    readonly field: keyof E['props']
    readonly operator: Operator
    readonly value: E['props'][keyof E['props']]
  }): Filter<E> {
    return new Filter(props.field, props.operator, props.value)
  }
}
