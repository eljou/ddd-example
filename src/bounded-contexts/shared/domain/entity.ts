import { GenericId } from './value-objects/id'

const isEntity = (v: unknown): v is Entity<unknown> => {
  return v instanceof Entity
}

export abstract class Entity<T> {
  readonly _id: GenericId
  readonly props: T

  constructor(props: T, id?: GenericId) {
    this._id = id ? id : GenericId.generateUnique()
    this.props = props
  }

  equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) return false
    if (this === object) return true
    if (!isEntity(object)) return false
    return this._id.value == object._id.value
  }
}
