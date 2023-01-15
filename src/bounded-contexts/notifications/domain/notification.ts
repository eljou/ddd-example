import { ToPrimitives } from '@shared/custom-types'
import { AggregateRoot } from '@shared/domain/aggregate-root'
import { GenericId } from '@shared/domain/value-objects/id'
import { NonEmptyString } from '@shared/domain/value-objects/non-empty-string'

import { Email } from './value-objects/email'

interface NotificationProps {
  title: NonEmptyString
  message: NonEmptyString
  email: Email
  emitted: Date
}

export class Notification extends AggregateRoot<NotificationProps> {
  private constructor(props: NotificationProps) {
    super(props, GenericId.generateUnique())
  }

  static create(props: Omit<NotificationProps, 'emitted'>): Notification {
    return new Notification({ ...props, emitted: new Date() })
  }

  toPrimitives(): ToPrimitives<Notification> {
    return {
      _id: this._id.value,
      props: {
        title: this.props.title.value,
        message: this.props.message.value,
        email: this.props.email.value,
        emitted: this.props.emitted,
      },
    }
  }
}
