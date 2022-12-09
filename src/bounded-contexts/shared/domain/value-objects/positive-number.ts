import { InvalidArgument } from '../errors'
import { ValueObject } from './value-object'

export class PositiveNumber extends ValueObject<number> {
  constructor(value: number) {
    super(value)
    if (this.value > 0) throw InvalidArgument.create("Value can't be lower than 1")
  }
}
