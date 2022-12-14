import { inject, injectable } from 'tsyringe'

import { Criteria, Filter } from '@src/bounded-contexts/shared/domain/criteria'
import { UseCase } from '@src/bounded-contexts/shared/domain/use-case'

import { Reservation } from '../domain/reservation'
import { ReservationRepository } from '../domain/reservation-repository'
import { ClientName } from '../domain/value-objects/client-name'
import { ReservationDate } from '../domain/value-objects/reservation-date'

type Input = { clientName: ClientName; date?: ReservationDate }

@injectable()
export class ByUserReservationsFinder extends UseCase<Input, Reservation[]> {
  constructor(@inject('ReservationRepository') private repository: ReservationRepository) {
    super()
  }

  run(input: Input): Promise<Reservation[]> {
    const criteria = new Criteria<Reservation>({
      filters: [Filter.create({ field: 'clientName', operator: '=', value: input.clientName })],
    })
    if (input.date) criteria.filters.push(Filter.create({ field: 'date', operator: '=', value: input.date }))

    return this.repository.search(criteria)
  }
}
