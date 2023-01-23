import { inject, singleton } from 'tsyringe'

import { NotificationSender } from '@notifications/application/notification-sender'
import { Email } from '@notifications/domain/value-objects/email'
import { ReservationCreated } from '@reservations/domain/reservation-created-event'
import { DomainEvent } from '@shared/domain/domain-event'
import { DomainEventSubscriber } from '@shared/domain/domain-event-subscriber'
import { Logger } from '@shared/domain/logger'
import { NonEmptyString } from '@shared/domain/value-objects/non-empty-string'

@singleton()
export class NotificationsSubscriber implements DomainEventSubscriber<ReservationCreated> {
  constructor(@inject('Logger') private readonly logger: Logger, private readonly useCase: NotificationSender) {}

  subsribedTo(): Array<{
    eventName: typeof DomainEvent.EVENT_NAME
    fromPrimitives: typeof DomainEvent.fromPrimitives
  }> {
    return [
      {
        eventName: ReservationCreated.EVENT_NAME,
        fromPrimitives: ReservationCreated.fromPrimitives,
      },
    ]
  }

  async on(domainEvent: ReservationCreated): Promise<void> {
    this.logger.debug(`[subscriber] on event: ${JSON.stringify(domainEvent.toPrimitives())}`)

    this.useCase.run({
      title: new NonEmptyString('Reservation Created'),
      message: new NonEmptyString(
        `Reservation of ${domainEvent.payload.props.seats.value} seats accepted for client: ${
          domainEvent.payload.props.clientName.value
        }, on: ${domainEvent.payload.props.date.value.toLocaleString()}`,
      ),
      email: new Email('jhon@mail.com'),
    })
  }
}
