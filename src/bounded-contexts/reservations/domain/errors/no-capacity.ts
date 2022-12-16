import { CustomError } from '@shared/domain/errors/custom-error'

export class NoCapacity extends CustomError<typeof NoCapacity.CODE> {
  static CODE = 'NO_CAPACITY' as const

  private constructor(totalCapacity: number, seats: number) {
    super(NoCapacity.CODE, `Failed to make reservation, no capacity.`, { totalCapacity, seats })
  }

  static create(totalCapacity: number, seats: number): NoCapacity {
    return new NoCapacity(totalCapacity, seats)
  }
}
