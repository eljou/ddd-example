import { inject, injectable } from 'tsyringe'
import { z } from 'zod'

import { ByUserReservationsFinder } from '@reservations/application/by-user-reservations-finder'
import { ClientName } from '@reservations/domain/value-objects/client-name'
import { ReservationDate } from '@reservations/domain/value-objects/reservation-date'
import { InvalidArgument } from '@shared/domain/errors'
import { Logger } from '@shared/domain/logger'
import { KoaContex } from '@shared/infrastructure/http-server'

import { Controller } from '../controller'

@injectable()
export class FindByClientNameReservationController extends Controller<
  false,
  z.infer<typeof FindByClientNameReservationController.bodySchema>
> {
  constructor(private useCase: ByUserReservationsFinder, @inject('Logger') logger: Logger) {
    super(logger)
  }

  static bodySchema = z.object({ client_name: z.string() })

  async handle(ctx: KoaContex<false, z.infer<typeof FindByClientNameReservationController.bodySchema>>): Promise<void> {
    const dateOrUndefined = ctx.query['date']
    let date: string | null = null
    if (dateOrUndefined) {
      const parsedDate = z.string().datetime().safeParse(dateOrUndefined)
      if (!parsedDate.success) return this.badRequest('Invalid query param date', { date: dateOrUndefined })

      date = parsedDate.data
    }

    try {
      const results = await this.useCase.run({
        clientName: new ClientName(ctx.request.body.client_name),
        ...(date ? { date: new ReservationDate(new Date(date)) } : {}),
      })

      return this.ok(
        ctx.response,
        results.map(r => r.toPrimitives()),
      )
    } catch (error) {
      if (error instanceof InvalidArgument) this.badRequest(error.name, error.toJSON())
      throw error
    }
  }
}
