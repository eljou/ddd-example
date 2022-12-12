import { PositiveNumber } from '@src/bounded-contexts/shared/domain/value-objects/positive-number'
import { PositiveNumberMother } from '@src/bounded-contexts/shared/domain/value-objects/__test__/positive-number-mother'
import { NoCapacity } from '../../domain/errors/no-capacity'
import { Reservation } from '../../domain/reservation'
import { ClientNameMother } from '../../domain/__test__/client-name-mother'
import { ReservationDateMother } from '../../domain/__test__/reservation-date-mother'
import { InMemoryReservationRepository } from '../../infrastructure/persistance/in-memory-reservation-repository'
import { ReservationCreator } from '../reservation-creator'

describe('ReservationCreator', () => {
  const repository = new InMemoryReservationRepository()
  let reservationCreator: ReservationCreator

  beforeEach(() => {
    repository.clean()
    reservationCreator = new ReservationCreator(repository)
  })

  it('should fail for no capacity', async () => {
    try {
      await reservationCreator.run({
        clientName: ClientNameMother.random(),
        seats: new PositiveNumber(21),
        date: ReservationDateMother.random(),
      })
    } catch (error) {
      expect(error).toBeInstanceOf(NoCapacity)
    }
  })

  it('should save a valid reservation', async () => {
    const reservation = await reservationCreator.run({
      clientName: ClientNameMother.random(),
      seats: PositiveNumberMother.random(),
      date: ReservationDateMother.random(),
    })
    const fromRepo = await repository.getById(reservation._id)
    expect(fromRepo).toBeDefined()
    expect(reservation.equals(fromRepo as Reservation)).toBeTruthy()
  })
})
