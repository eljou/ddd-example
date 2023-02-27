import { singleton } from 'tsyringe'

import { Criteria, Filter } from '@shared/domain/criteria'
import { ValueObject } from '@shared/domain/value-objects/value-object'
import { assertNever, comparePrimitives } from '@shared/utility-functions'

import { Reservation } from '../../domain/reservation'
import { ReservationRepository } from '../../domain/reservation-repository'
import { ReservationId } from '../../domain/value-objects/reservation-id'

type ReservationDB = {
  id: string
  clientName: string
  seats: number
  date: Date
  accepted: boolean
}

@singleton()
export class InMemoryReservationRepository implements ReservationRepository {
  readonly db: Map<string, ReservationDB>

  constructor() {
    this.db = new Map()
  }

  clean(): void {
    this.db.clear()
  }

  async add(r: Reservation): Promise<void> {
    this.db.set(r._id.value, r.toPrimitives())
  }

  async getById(id: ReservationId): Promise<Reservation | null> {
    const res = this.db.get(id.value)
    if (!res) return null
    return Reservation.fromPrimitives(res)
  }

  private evaluateFilter(r: Reservation, { operator, field, value: filterValue }: Filter<Reservation>): boolean {
    const resFieldValue = r.props[field]
    const a = resFieldValue instanceof ValueObject ? resFieldValue.value : resFieldValue
    const b = filterValue instanceof ValueObject ? filterValue.value : filterValue
    switch (operator) {
      case '!=':
        return comparePrimitives(a, b) != 0
      case '=':
        return comparePrimitives(a, b) == 0
      case '<':
        return comparePrimitives(a, b) == -1
      case '>':
        return comparePrimitives(a, b) == 1
      case '<=':
        return comparePrimitives(a, b) == 0 || comparePrimitives(a, b) == -1
      case '>=':
        return comparePrimitives(a, b) == 0 || comparePrimitives(a, b) == 1
      case 'CONTAINS':
        return typeof a == 'string' && typeof b == 'string' && a.includes(b)
      case 'NOT_CONTAINS':
        return typeof a == 'string' && typeof b == 'string' && !a.includes(b)
      case 'STARTS_WITH':
        return typeof a == 'string' && typeof b == 'string' && a.startsWith(b)
      case 'ENDS_WITH':
        return typeof a == 'string' && typeof b == 'string' && a.endsWith(b)
      default:
        assertNever(operator)
    }
  }

  async search({ filters, limit, offset = 0, order }: Criteria<Reservation>): Promise<Reservation[]> {
    const reservations = [...this.db.values()]
      .map(Reservation.fromPrimitives)
      .filter(reservation => filters.reduce((prev, f) => prev && this.evaluateFilter(reservation, f), true))
      .slice(offset, limit ? offset + limit : undefined)

    if (order)
      reservations.sort((r1, r2) => {
        const r1By = r1.props[order.by]
        const r2By = r2.props[order.by]
        if (r1By instanceof ValueObject) return r1By.compare(r2By as any, order.type)
        return comparePrimitives(r1By, r2By as any, order.type)
      })

    return reservations
  }
}
