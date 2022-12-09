import { InvalidArgument } from '../errors'
import { ValueObject } from './value-object'

export class NonEmptyString extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    if (this.value.length === 0) throw InvalidArgument.create("Value can't be empty")
  }
}
