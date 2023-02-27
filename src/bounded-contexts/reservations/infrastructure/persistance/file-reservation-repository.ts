import { existsSync, promises, writeFileSync } from 'fs'

import { deserialize, serialize } from 'bson'
import { singleton } from 'tsyringe'

import { Criteria, Filter } from '@shared/domain/criteria/'
import { DatabaseFailure } from '@shared/domain/errors/database-error'
import { ValueObject } from '@shared/domain/value-objects/value-object'
import { assertNever, comparePrimitives, makeSafeError } from '@shared/utility-functions'

import { Reservation } from '../../domain/reservation'
import { ReservationRepository } from '../../domain/reservation-repository'
import { ReservationId } from '../../domain/value-objects/reservation-id'

@singleton()
export class FileReservationRepository implements ReservationRepository {
  static ENCODING = 'utf-8' as const
  public dbFile = './db.txt'
  constructor() {
    if (!existsSync(this.dbFile)) writeFileSync(this.dbFile, '')
  }

  private async dbLines(): Promise<string[]> {
    return (await promises.readFile(this.dbFile, { encoding: FileReservationRepository.ENCODING }))
      .split('\n')
      .filter(l => l.trim() !== '')
  }

  private strToReservation(line: string): Reservation {
    return Reservation.fromPrimitives(deserialize(Buffer.from(line, 'base64')) as any)
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

  private errToDbFailure(operation: Parameters<typeof DatabaseFailure.create>[1]) {
    return (err: unknown): never => {
      throw DatabaseFailure.create(makeSafeError(err).message, operation, 'reservations')
    }
  }

  async add(r: Reservation): Promise<void> {
    await promises
      .appendFile(this.dbFile, serialize(r.toPrimitives()).toString('base64') + '\n')
      .catch(this.errToDbFailure('insert'))
  }

  async getById(id: ReservationId): Promise<Reservation | null> {
    return (
      (await this.dbLines().catch(this.errToDbFailure('read')))
        .filter(line => line.length != 0)
        .map(this.strToReservation)
        .find(res => res._id.value == id.value) ?? null
    )
  }

  async search({ filters, limit, offset = 0, order }: Criteria<Reservation>): Promise<Reservation[]> {
    const reservations = (await this.dbLines().catch(this.errToDbFailure('read')))
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
