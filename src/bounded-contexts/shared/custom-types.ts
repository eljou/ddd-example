export type Primitive = string | number | boolean | Date | null

export type JSONType = Exclude<Primitive, 'Date'> | Array<JSONType> | { [key: string]: JSONType }

export type OrderType = 'ASC' | 'DEC'

declare const __type__: unique symbol
declare const __brand__: unique symbol
type Opaque<T, K = unknown> = T & {
  readonly [__type__]: T
  readonly [__brand__]: K
}
type BaseType<O extends Opaque<unknown>> = O[typeof __type__]
type BrandType<O extends Opaque<unknown>> = O[typeof __brand__]

type OpaqueBuilder<O extends Opaque<unknown>> = {
  create: (value: BaseType<O>) => O
  widen: (value: O) => BaseType<O>
  tryCreate: (value: BaseType<O>) => { kind: 'failed'; err: Error } | { kind: 'success'; value: O }
}

const Opaque = {
  create: <O extends Opaque<unknown>>(value: BaseType<O>): O => value as O,
  widen: <O extends Opaque<unknown>>(value: O): BaseType<O> => value,
}

type UserName = Opaque<string, 'username'>
const UserName: OpaqueBuilder<UserName> = {
  create: value => {
    if (value.split(' ').length <= 1) throw new Error('Invalid username')
    return Opaque.create(value)
  },

  tryCreate: value => {
    try {
      const uname = UserName.create(value)
      return { kind: 'success', value: uname }
    } catch (error) {
      return { kind: 'failed', err: error as Error }
    }
  },

  widen: value => Opaque.widen(value),
}
