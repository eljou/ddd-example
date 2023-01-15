import { Notification } from './notification'

export interface NotificationSenderSvc {
  send(n: Notification): Promise<void>
}
