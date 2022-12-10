import { UseCase } from '@src/bounded-contexts/shared/domain/use-case'
import { PositiveNumber } from '@src/bounded-contexts/shared/domain/value-objects/positive-number'
import { Reservation } from '../domain/reservation'
import { ReservationRepository } from '../domain/reservation-repository'
import { ClientName } from '../domain/value-objects/client-name'

type Input = { clientName: ClientName; seats: PositiveNumber; date: Date }
export class ReservationCreator extends UseCase<Input, Reservation> {
  constructor(private repository: ReservationRepository) {
    super()
  }

  async run(params: Input): Promise<Reservation> {
    const reservation = Reservation.create({
      clientName: params.clientName,
      seats: params.seats,
      date: params.date,
      accepted: true,
    })
    await this.repository.add(reservation)
    return reservation
  }
}
