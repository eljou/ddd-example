import { OrderType, Primitive } from '../../custom-types'
import { InvalidArgument } from '../errors'

export abstract class ValueObject<T extends Primitive> {
  constructor(public readonly value: T) {
    this.ensureValueIsDefined(value)
  }

  private ensureValueIsDefined(value: T): void {
    if (value === null || value === undefined) {
      throw InvalidArgument.create('Value must be defined')
    }
  }

  compare(other: ValueObject<T>, order: OrderType = 'ASC'): number {
    const thisValue = this.value as Exclude<T, null>
    const otherValue = other.value as Exclude<T, null>
    if (this.value == other.value) return 0
    if (order == 'ASC') return thisValue <= otherValue ? -1 : 1
    return thisValue < otherValue ? 1 : -1
  }

  toString(): string {
    return this.value?.toString() ?? 'null'
  }
}
