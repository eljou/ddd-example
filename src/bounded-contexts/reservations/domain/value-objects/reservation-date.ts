import { ValueObject } from '@src/bounded-contexts/shared/domain/value-objects/value-object'

export class ReservationDate extends ValueObject<Date> {
  constructor(date: Date) {
    super(new Date(date.getFullYear(), date.getMonth(), date.getDate()))
  }
}
