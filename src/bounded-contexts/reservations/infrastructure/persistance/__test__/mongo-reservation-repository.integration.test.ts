import tsValidMongoDb from 'ts-valid-mongodb'

import { ReservationDateMother } from '@reservations/domain/__test__/reservation-date-mother'
import { ReservationMother } from '@reservations/domain/__test__/reservation-mother'
import { ReservationId } from '@reservations/domain/value-objects/reservation-id'
import { Filter } from '@shared/domain/criteria'
import { PositiveNumber } from '@shared/domain/value-objects/positive-number'
import { MongoEnvironmentArranger } from '@shared/infrastructure/__test__/mongo-env-arranger'

import { MongodbReservationRepository } from '../mongo-reservation-repository'

describe('MongoReservationRepository', () => {
  const envArranger = new MongoEnvironmentArranger(tsValidMongoDb)
  const mongoReservationRepository = new MongodbReservationRepository()

  beforeAll(async () => {
    await tsValidMongoDb.connect('mongodb://localhost:27017', 'integration-tests-db')
  })

  afterAll(async () => {
    await envArranger.arrange()
    await envArranger.close()
  })

  beforeEach(async () => {
    await envArranger.arrange()
  })

  it('should be able to save a reservation', async () => {
    await mongoReservationRepository.add(ReservationMother.random())
  })

  it('should be able to find by id an inserted reservation', async () => {
    const reservation = ReservationMother.random()
    await mongoReservationRepository.add(reservation)

    const found = await mongoReservationRepository.getById(reservation._id)
    expect(found).toBeDefined()
    expect(found?._id.compare(reservation._id)).toEqual(0)
  })

  it('should return null when trying to find an unexisting reservation', async () => {
    const notFound = await mongoReservationRepository.getById(ReservationId.generateUnique())
    expect(notFound).toBeNull()
  })

  describe('mongoReservationRepository.search tests', () => {
    beforeEach(async () => {
      await Promise.all([...new Array(20)].map(() => mongoReservationRepository.add(ReservationMother.random())))
    })

    it('should be able to sort responses', async () => {
      const inDecendantOrder = await mongoReservationRepository.search({
        filters: [],
        order: { by: 'clientName', type: 'DEC' },
      })
      const inAscendantOrder = await mongoReservationRepository.search({
        filters: [],
        order: { by: 'clientName', type: 'ASC' },
      })

      expect(inDecendantOrder[0]._id.compare(inAscendantOrder[inDecendantOrder.length - 1]._id)).toEqual(0)
      expect(inAscendantOrder[0]._id.compare(inDecendantOrder[inDecendantOrder.length - 1]._id)).toEqual(0)
    })

    it('should be able to limit responses', async () => {
      const limit = 5
      const res = await mongoReservationRepository.search({ filters: [], limit })
      expect(res.length).toEqual(limit)
    })

    it('should be able to skip responses', async () => {
      const limit = 5
      const offset = 2
      const all = await mongoReservationRepository.search({ filters: [] })
      const skipped = await mongoReservationRepository.search({ filters: [], limit, offset })

      expect(all[2]._id.compare(skipped[0]._id)).toEqual(0)
    })

    it('should be able to apply some query filters over seats', async () => {
      const all = await mongoReservationRepository.search({ filters: [] })
      const founds = await mongoReservationRepository.search({
        filters: [Filter.create({ field: 'seats', operator: '>', value: new PositiveNumber(3) })],
      })

      expect(all.filter(r => r.props.seats.value > 3).length).toEqual(founds.length)
    })

    it('should be able to apply some query over date', async () => {
      const all = await mongoReservationRepository.search({ filters: [] })

      const lowerDate = ReservationDateMother.random(1)
      const upperDate = ReservationDateMother.random(2)
      const founds = await mongoReservationRepository.search({
        filters: [
          Filter.create({ field: 'date', operator: '>=', value: lowerDate }),
          Filter.create({ field: 'date', operator: '<=', value: upperDate }),
        ],
      })

      expect(founds.length).toEqual(
        all.filter(r => r.props.date.value >= lowerDate.value && r.props.date.value <= upperDate.value).length,
      )
    })
  })
})
