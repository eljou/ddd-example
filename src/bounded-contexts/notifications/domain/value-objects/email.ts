import { z } from 'zod'

import { NonEmptyString } from '@shared/domain/value-objects/non-empty-string'
import { InvalidArgument } from '@src/bounded-contexts/shared/domain/errors'

export class Email extends NonEmptyString {
  constructor(value: string) {
    super(value)
    const emailParsed = z.string().email().safeParse(value)
    if (!emailParsed.success) throw InvalidArgument.create(emailParsed.error.message)
  }
}
