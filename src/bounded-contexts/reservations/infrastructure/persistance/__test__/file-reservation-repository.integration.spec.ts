import { deserialize } from 'bson'
import { existsSync, promises } from 'fs'
import { faker } from '@faker-js/faker'
import { FileReservationRepository } from '../file-reservation-repository'
import { ReservationMother } from '@src/bounded-contexts/reservations/domain/__test__/reservation-mother'
import { ClientName } from '@src/bounded-contexts/reservations/domain/value-objects/client-name'
import { Criteria, Filter } from '@src/bounded-contexts/shared/domain/criteria/criteria'
import { Reservation } from '@src/bounded-contexts/reservations/domain/reservation'

describe('FileReservationRepository', () => {
  let fileReservationRepository: FileReservationRepository

  const clearDb = async () => {
    if (existsSync(fileReservationRepository.dbFile)) await promises.unlink(fileReservationRepository.dbFile)
  }

  beforeEach(async () => {
    fileReservationRepository = new FileReservationRepository()
    await clearDb()
  })

  afterAll(async () => {
    await clearDb()
  })

  it('should save a reservation to file', async () => {
    const reservationToSave = ReservationMother.random()
    await fileReservationRepository.add(reservationToSave)
    const fileStr = await promises.readFile(fileReservationRepository.dbFile, {
      encoding: FileReservationRepository.ENCODING,
    })
    const lines = fileStr.split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).not.toHaveLength(0)

    const foundReservation = deserialize(Buffer.from(lines[0], 'hex'))
    expect(foundReservation).toMatchObject(reservationToSave.toPrimitives())
  })

  it('should get by id', async () => {
    const reservation = ReservationMother.randomWithProps({ date: faker.date.soon(), accepted: true })
    await fileReservationRepository.add(reservation)

    const found = await fileReservationRepository.getById(reservation._id)
    expect(found?.toPrimitives()).toMatchObject(reservation.toPrimitives())
  })

  it('should search by using equals filter on clientName', async () => {
    const clientName = new ClientName(`${faker.name.firstName()} ${faker.name.lastName()}`)
    const reservation = ReservationMother.randomWithProps({ clientName })
    await Promise.all([
      fileReservationRepository.add(reservation),
      [...new Array(5)].map(() => fileReservationRepository.add(ReservationMother.random())),
    ])

    const founds = await fileReservationRepository.search(
      new Criteria({
        filters: [{ field: 'clientName', operator: '=', value: clientName } as Filter<Reservation, 'clientName'>],
      }),
    )

    expect(founds).toHaveLength(1)
    expect(founds[0].equals(reservation))
    expect(founds[0].props.clientName.value).toBe(clientName.value)
  })

  it('should search by using criteria with order and limit', async () => {
    await Promise.all([[...new Array(5)].map(() => fileReservationRepository.add(ReservationMother.random()))])

    const founds = await fileReservationRepository.search(
      new Criteria({
        filters: [],
        order: { by: 'seats', type: 'ASC' },
        limit: 3,
      }),
    )

    expect(founds).toHaveLength(3)
    expect(founds[0].props.seats.value).toBeLessThanOrEqual(founds[2].props.seats.value)
  })
})
