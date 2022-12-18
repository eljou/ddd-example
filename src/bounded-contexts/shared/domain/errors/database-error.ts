import { JSONType } from '../../custom-types'
import { CustomError } from './custom-error'

export class DatabaseFailure extends CustomError<typeof DatabaseFailure.CODE> {
  static CODE = 'DATABASE_FAILURE'

  private constructor(msg: string, metadata: JSONType) {
    super(DatabaseFailure.CODE, msg, metadata)
  }

  static create(msg: string, operation: 'read' | 'update' | 'delete' | 'insert', record: string): DatabaseFailure {
    return new DatabaseFailure(msg, { operation, record })
  }
}
