import { InvalidArgument } from '@shared/domain/errors'
import { NonEmptyString } from '@shared/domain/value-objects/non-empty-string'

export class ClientName extends NonEmptyString {
  constructor(value: string) {
    super(value)
    if (value.split(' ').length < 2) throw InvalidArgument.create('clientName must have more than one member')
  }
}
