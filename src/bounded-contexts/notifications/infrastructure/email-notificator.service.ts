import { inject, singleton } from 'tsyringe'

import { Logger } from '@shared/domain/logger'

import { Notification } from '../domain/notification'
import { NotificationSenderSvc } from '../domain/notification-sender.service'

@singleton()
export class EmailNotificatorService implements NotificationSenderSvc {
  constructor(@inject('Logger') private readonly logger: Logger) {}

  async send(n: Notification): Promise<void> {
    this.logger.info(
      `Sent notification with id: ${n._id.value} to: ${n.props.email.value}\n title: ${n.props.title.value}\n message: ${n.props.message.value}`,
    )
  }
}
