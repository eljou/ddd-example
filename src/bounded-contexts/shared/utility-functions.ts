import { OrderType, Primitive } from './custom-types'

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export function comparePrimitives<P extends Exclude<Primitive, null>>(p1: P, p2: P, order: OrderType = 'ASC'): number {
  if (order == 'ASC') return p1 <= p2 ? -1 : 1
  return p1 < p2 ? 1 : -1
}
