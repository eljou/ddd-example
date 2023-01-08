/* eslint-disable @typescript-eslint/ban-types */
export type Primitive = string | number | boolean | Date | null

export type JSONType = Exclude<Primitive, 'Date'> | Array<JSONType> | { [key: string]: JSONType }

export type OrderType = 'ASC' | 'DEC'

type Methods<T> = {
  [P in keyof T]: T[P] extends Function ? P : never
}[keyof T]

type MethodsAndProperties<T> = { [key in keyof T]: T[key] }

type Properties<T> = Omit<MethodsAndProperties<T>, Methods<T>>

type Obj = { [key: string]: unknown } | object
type ValueObjectValue<T> = {
  [key in keyof T]: T[key] extends { value: unknown }
    ? Pick<T[key], 'value'>['value']
    : T[key] extends Array<{ value: unknown }>
    ? Pick<T[key][number], 'value'>['value'][]
    : T[key] extends Array<Obj>
    ? ToPrimitives<T[key][number]>[]
    : T[key] extends Obj
    ? ToPrimitives<T[key]>
    : T[key]
}

export type ToPrimitives<T> = ValueObjectValue<Properties<T>>

/* declare const __type__: unique symbol
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
 */
