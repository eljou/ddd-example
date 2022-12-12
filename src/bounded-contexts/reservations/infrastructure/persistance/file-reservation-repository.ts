import { Criteria, Filter } from '@src/bounded-contexts/shared/domain/criteria/'
import { ValueObject } from '@src/bounded-contexts/shared/domain/value-objects/value-object'
import { assertNever, comparePrimitives } from '@src/bounded-contexts/shared/utility-functions'
import { serialize, deserialize } from 'bson'
import { promises } from 'fs'
import { Reservation } from '../../domain/reservation'
import { ReservationRepository } from '../../domain/reservation-repository'
import { ReservationId } from '../../domain/value-objects/reservation-id'

export class FileReservationRepository implements ReservationRepository {
  static ENCODING = 'utf-8' as const
  public dbFile = './db.txt'

  private async dbLines(): Promise<string[]> {
    return (await promises.readFile(this.dbFile, { encoding: FileReservationRepository.ENCODING }))
      .split('\n')
      .filter(l => l.trim() !== '')
  }

  private strToReservation(line: string): Reservation {
    return Reservation.fromPrimitives(deserialize(Buffer.from(line, 'hex')) as any)
  }

  private evaluateFilter(r: Reservation, { operator, field, value: filterValue }: Filter<Reservation>): boolean {
    const resFieldValue = r.props[field]
    const a = resFieldValue instanceof ValueObject ? resFieldValue.value : resFieldValue
    const b = filterValue instanceof ValueObject ? filterValue.value : filterValue
    switch (operator) {
      case '!=':
        return a instanceof Date && b instanceof Date ? a.toString() != b.toString() : a != b
      case '=':
        return a instanceof Date && b instanceof Date ? a.toString() == b.toString() : a === b
      case '<':
        return a < b
      case '>':
        return a > b
      case 'CONTAINS':
        return typeof a == 'string' && typeof b == 'string' && a.includes(b)
      case 'NOT_CONTAINS':
        return typeof a == 'string' && typeof b == 'string' && !a.includes(b)
      default:
        assertNever(operator)
    }
  }

  async add(r: Reservation): Promise<void> {
    await promises.appendFile(this.dbFile, serialize(r.toPrimitives()).toString('hex') + '\n')
  }

  async getById(id: ReservationId): Promise<Reservation | null> {
    return (
      (await this.dbLines())
        .filter(line => line.length != 0)
        .map(this.strToReservation)
        .find(res => res._id.value == id.value) ?? null
    )
  }

  async search({ filters, limit, offset = 0, order }: Criteria<Reservation>): Promise<Reservation[]> {
    const reservations = (await this.dbLines())
      .map(this.strToReservation)
      .filter(r => filters.reduce((prev, filter) => prev && this.evaluateFilter(r, filter), true))
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