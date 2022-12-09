import { Primitive } from '../../custom-types'
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

  toString(): string {
    return this.value?.toString() ?? 'null'
  }
}
