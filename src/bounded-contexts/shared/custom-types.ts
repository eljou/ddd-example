/* eslint-disable @typescript-eslint/ban-types */
export type Primitive = string | number | boolean | Date | null

export type JSONType = Exclude<Primitive, 'Date'> | Array<JSONType> | { [key: string]: JSONType }

export type OrderType = 'ASC' | 'DEC'

type Fn = (...args: any[]) => any

type Methods<T> = {
  [P in keyof T]: T[P] extends Fn ? P : never
}[keyof T]

type MethodsAndProperties<T> = { [key in keyof T]: T[key] }

type Properties<T> = Omit<MethodsAndProperties<T>, Methods<T>>

type MapNullableValueObject<T extends { value: unknown } | undefined> = T extends { value: unknown }
  ? T['value']
  : undefined

type MapNullableArrayOfValueObjects<T extends Array<{ value: unknown }> | undefined> = T extends Array<{
  value: unknown
}>
  ? T[number]['value'][]
  : undefined

type Obj = { [key: string]: unknown } | object
type MapType<T> = {
  [key in keyof T]: T[key] extends { value: unknown }
    ? MapNullableValueObject<T[key]>
    : T[key] extends Array<{ value: unknown }> | undefined
    ? MapNullableArrayOfValueObjects<T[key]>
    : T[key] extends Array<Obj>
    ? ToPrimitives<T[key][number]>[]
    : T[key] extends Date
    ? Date
    : T[key] extends Obj
    ? ToPrimitives<T[key]>
    : T[key]
}

export type ToPrimitives<T> = MapType<Properties<T>>

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
