export type Primitive = string | number | boolean | Date | null

export type JSONType = Omit<Primitive, 'Date'> | Array<JSONType> | { [key: string]: JSONType }

export type OrderType = 'ASC' | 'DEC'
