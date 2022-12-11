import { Entity } from '../entity'

type Operator = '=' | '!=' | '>' | '<' | 'CONTAINS' | 'NOT_CONTAINS'
export class Filter<E extends Entity<unknown>> {
  private constructor(
    readonly field: keyof E['props'],
    readonly operator: Operator,
    readonly value: E['props'][keyof E['props']],
  ) {}

  static create<E extends Entity<unknown>, T extends keyof E['props']>(props: {
    readonly field: T
    readonly operator: Operator
    readonly value: E['props'][T]
  }): Filter<E> {
    return new Filter(props.field, props.operator, props.value)
  }
}
