import { Criteria, Filter } from '@src/bounded-contexts/shared/domain/criteria'
import { UseCase } from '@src/bounded-contexts/shared/domain/use-case'
import { PositiveNumber } from '@src/bounded-contexts/shared/domain/value-objects/positive-number'
import { Reservation } from '../domain/reservation'
import { ReservationRepository } from '../domain/reservation-repository'
import { totalCapacity } from '../domain/total-capatity'
import { ClientName } from '../domain/value-objects/client-name'
import { ReservationDate } from '../domain/value-objects/reservation-date'

type Input = { clientName: ClientName; seats: PositiveNumber; date: ReservationDate }
export class ReservationCreator extends UseCase<Input, Reservation> {
  constructor(private repository: ReservationRepository) {
    super()
  }

  async run(params: Input): Promise<Reservation> {
    const previousReservations = await this.repository.search(
      new Criteria({
        filters: [
          Filter.create({ field: 'accepted', operator: '=', value: true }),
          Filter.create({ field: 'date', operator: '=', value: params.date }),
        ],
      }),
    )

    const reservation = Reservation.create({ clientName: params.clientName, seats: params.seats, date: params.date })
    reservation.tryAcceptReservation(previousReservations, totalCapacity)

    await this.repository.add(reservation)
    return reservation
  }
}
