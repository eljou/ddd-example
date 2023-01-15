import { inject, singleton } from 'tsyringe'

import { DomainEventSubscriber } from '@shared/domain/domain-event-subscriber'
import { Logger } from '@shared/domain/logger'
import { NonEmptyString } from '@shared/domain/value-objects/non-empty-string'
import { NotificationSender } from '@src/bounded-contexts/notifications/application/notification-sender'
import { Email } from '@src/bounded-contexts/notifications/domain/value-objects/email'
import { ReservationCreated } from '@src/bounded-contexts/reservations/domain/reservation-created-event'
import { EventName } from '@src/bounded-contexts/shared/domain/domain-event'

@singleton()
export class NotificationsSubscriber implements DomainEventSubscriber<ReservationCreated> {
  constructor(@inject('Logger') private readonly logger: Logger, private readonly useCase: NotificationSender) {}

  subscribedTo(): EventName[] {
    return [ReservationCreated.EVENT_NAME]
  }

  async on(domainEvent: ReservationCreated): Promise<void> {
    const data = domainEvent.toPrimitives()
    this.logger.debug(`[subscriber] on event: ${JSON.stringify(domainEvent.toPrimitives())}`)

    this.useCase.run({
      title: new NonEmptyString('Reservation Created'),
      message: new NonEmptyString(
        `Reservation of ${data.attributes.seats} seats accepted for client: ${
          data.attributes.clientName
        }, on: ${data.attributes.date.toLocaleString()}`,
      ),
      email: new Email('jhon@mail.com'),
    })
  }
}
