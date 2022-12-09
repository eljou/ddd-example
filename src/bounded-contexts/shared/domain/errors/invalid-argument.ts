import { CustomError } from './custom-error'

export class InvalidArgument extends CustomError<typeof InvalidArgument.CODE> {
  static CODE = 'INVALID_ARGUMENT'
  static create(msg: string): InvalidArgument {
    return new InvalidArgument(InvalidArgument.CODE, msg)
  }
}
