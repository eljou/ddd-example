import { container } from 'tsyringe'

import { ClientNameMother } from '../../domain/__test__/client-name-mother'
import { ReservationMother } from '../../domain/__test__/reservation-mother'
import { ClientName } from '../../domain/value-objects/client-name'
import { InMemoryReservationRepository } from '../../infrastructure/persistance/in-memory-reservation-repository'
import { ByUserReservationsFinder } from '../by-user-reservations-finder'

describe('ByUserReservationsFinder', () => {
  container.registerSingleton('ReservationRepository', InMemoryReservationRepository)

  let reservationFinder: ByUserReservationsFinder
  let repository: InMemoryReservationRepository

  beforeEach(() => {
    container.clearInstances()
    reservationFinder = container.resolve(ByUserReservationsFinder)
    repository = container.resolve('ReservationRepository')
  })

  it('should return empty data when no reservation is registered', async () => {
    const result = await reservationFinder.run({ clientName: ClientNameMother.random() })

    expect(result).toHaveLength(0)
  })

  it('should return empty data when no reservation is registered for provided ClientName', async () => {
    const randomReservation = ReservationMother.random()
    await repository.add(randomReservation)

    const result = await reservationFinder.run({
      clientName: new ClientName(randomReservation.props.clientName.value + ' dummy'),
    })

    expect(result).toHaveLength(0)
    expect([...repository.db.values()]).toHaveLength(1)
  })

  it('should return all reservations for a clientName', async () => {
    const cName = ClientNameMother.random()
    await Promise.all([
      repository.add(ReservationMother.random()),
      ...[...new Array(3)].map(() => repository.add(ReservationMother.randomWithProps({ clientName: cName }))),
    ])

    const result = await reservationFinder.run({ clientName: cName })

    expect(result).toHaveLength(3)
    expect([...repository.db.values()]).toHaveLength(4)
  })
})
