import { z } from 'zod'

import { InvalidArgument } from '@shared/domain/errors'
import { NonEmptyString } from '@shared/domain/value-objects/non-empty-string'

export class Email extends NonEmptyString {
  constructor(value: string) {
    super(value)
    const emailParsed = z.string().email().safeParse(value)
    if (!emailParsed.success) throw InvalidArgument.create(emailParsed.error.message)
  }
}
