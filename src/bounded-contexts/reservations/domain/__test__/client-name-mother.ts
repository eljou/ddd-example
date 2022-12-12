import { faker } from '@faker-js/faker'

import { ClientName } from '../value-objects/client-name'

export class ClientNameMother {
  static random(): ClientName {
    return new ClientName(`${faker.name.firstName()} ${faker.name.lastName()}`)
  }
}
