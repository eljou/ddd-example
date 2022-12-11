import { faker } from '@faker-js/faker'
import { PositiveNumber } from '../positive-number'

export class PositiveNumberMother {
  static random(): PositiveNumber {
    return new PositiveNumber(faker.datatype.number({ min: 1, max: 10 }))
  }
}
