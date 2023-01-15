import { inject, injectable } from 'tsyringe'

import { UseCase } from '@src/bounded-contexts/shared/domain/use-case'

import { Notification } from '../domain/notification'
import { NotificationSenderSvc } from '../domain/notification-sender.service'

type Input = Parameters<typeof Notification.create>[0]

@injectable()
export class NotificationSender extends UseCase<Input, void> {
  constructor(@inject('NotificationSenderSvc') private readonly notificationSenderSvc: NotificationSenderSvc) {
    super()
  }

  async run(input: Input): Promise<void> {
    const notificationToSend = Notification.create(input)
    await this.notificationSenderSvc.send(notificationToSend)
  }
}
