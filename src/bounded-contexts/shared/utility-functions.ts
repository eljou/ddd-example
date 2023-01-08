import { OrderType, Primitive } from './custom-types'

export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export function comparePrimitives<P extends Exclude<Primitive, null>>(p1: P, p2: P, order: OrderType = 'ASC'): number {
  if (p1 instanceof Date && p2 instanceof Date && p1.getTime() == p2.getTime()) return 0
  if (p1 == p2) return 0
  if (order == 'ASC') return p1 < p2 ? -1 : 1
  return p1 < p2 ? 1 : -1
}

export function makeSafeError(err: unknown): Error {
  if (err instanceof Error) return err
  if (typeof err == 'string') return new Error(err)
  if (typeof err == 'object') return new Error(JSON.stringify(err))
  return new Error(`${err}`)
}

export function formatBytes(n: number): string {
  const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0
  const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b'
  return `${(n / Math.pow(1024, k)).toFixed(2)} ${rank}`
}
