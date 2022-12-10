import { GenericId } from './value-objects/id'

export abstract class Entity<T> {
  protected readonly _id: GenericId
  protected props: T

  constructor(props: T, id?: GenericId) {
    this._id = id ? id : GenericId.generateUnique()
    this.props = props
  }
}
