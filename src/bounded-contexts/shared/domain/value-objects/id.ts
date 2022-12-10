import { randomBytes } from 'crypto'
import { InvalidArgument } from '../errors'
import { ValueObject } from './value-object'

export class GenericId extends ValueObject<string> {
  constructor(value: string) {
    super(value)
    if (this.value.length === 0) throw InvalidArgument.create("Id Value can't be empty")
  }

  static generateUnique(): GenericId {
    return new GenericId(randomBytes(16).toString('hex'))
  }
}
