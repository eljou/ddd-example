import { Filter as MongoFilter } from 'mongodb'
import tsValidMongoDb, { Schema } from 'ts-valid-mongodb'
import { singleton } from 'tsyringe'
import { z } from 'zod'

import { Reservation, ReservationPrimitives } from '@reservations/domain/reservation'
import { ReservationRepository } from '@reservations/domain/reservation-repository'
import { ReservationId } from '@reservations/domain/value-objects/reservation-id'
import { ToPrimitives } from '@shared/custom-types'
import { Criteria, Filter } from '@shared/domain/criteria'
import { ValueObject } from '@shared/domain/value-objects/value-object'
import { groupBy } from '@shared/utility-functions'

const reservationModel = tsValidMongoDb.createModel<ReservationPrimitives>(
  new Schema(
    'reservation',
    z.object({
      id: z.string(),
      clientName: z.string(),
      seats: z.number(),
      date: z.date(),
      accepted: z.boolean(),
    }),
    { indexes: [{ key: { id: 1 }, unique: true }, { key: { clientName: 1 } }] },
  ),
)

@singleton()
export class MongodbReservationRepository implements ReservationRepository {
  async add(r: Reservation): Promise<void> {
    await reservationModel.insert(r.toPrimitives())
  }

  async getById(id: ReservationId): Promise<Reservation | null> {
    const found = await reservationModel.findOneBy({ id: id.value })
    return found ? Reservation.fromPrimitives(found) : null
  }

  async search({ filters, limit, offset, order }: Criteria<Reservation>): Promise<Reservation[]> {
    const mapCriteriaFilterToMongoFilter = (crFilter: Filter<Reservation>): MongoFilter<ReservationPrimitives> => {
      const crFilterValue = crFilter.value instanceof ValueObject ? crFilter.value.value : crFilter.value
      const operatorMap: Record<Filter<Reservation>['operator'], MongoFilter<ReservationPrimitives>> = {
        '=': { $eq: crFilterValue },
        '!=': { $ne: crFilterValue },
        '<': { $lt: crFilterValue },
        '>': { $gt: crFilterValue },
        '>=': { $gte: crFilterValue },
        '<=': { $lte: crFilterValue },
        ENDS_WITH: { $regex: crFilterValue + '$', $options: 'i' },
        STARTS_WITH: { $regex: '^' + crFilterValue, $options: 'i' },
        CONTAINS: { $regex: crFilterValue, $options: 'i' },
        NOT_CONTAINS: { $not: { $regex: crFilterValue, $options: 'i' } },
      }

      return { [crFilter.field]: operatorMap[crFilter.operator] }
    }

    const groupedByField = groupBy<ToPrimitives<Filter<Reservation>>>(f => f.field)(filters)
    const founds = await reservationModel.advancedFind(
      {
        enhanceSearch: cursor => {
          if (offset) cursor.skip(offset)
          if (limit) cursor.limit(limit)
          if (order) cursor.sort({ [order.by]: order.type == 'ASC' ? 1 : -1 })
          return cursor
        },
        filters: Object.values(groupedByField).reduce<MongoFilter<ReservationPrimitives>>((acc, fs) => {
          if (fs.length > 1) return { ...acc, $and: fs.map(f => mapCriteriaFilterToMongoFilter(f)) }
          else if (fs.length == 1) return { ...acc, ...mapCriteriaFilterToMongoFilter(fs[0]) }
          else return acc
        }, {}),
      },
      null,
    )

    return founds.map(r => Reservation.fromPrimitives(r))
  }
}
