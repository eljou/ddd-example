import { inject, injectable } from 'tsyringe'
import { z } from 'zod'

import { ReservationCreator } from '@reservations/application/reservation-creator'
import { NoCapacity } from '@reservations/domain/errors/no-capacity'
import { ClientName } from '@reservations/domain/value-objects/client-name'
import { ReservationDate } from '@reservations/domain/value-objects/reservation-date'
import { InvalidArgument } from '@shared/domain/errors'
import { Logger } from '@shared/domain/logger'
import { PositiveNumber } from '@shared/domain/value-objects/positive-number'
import { KoaContex } from '@shared/infrastructure/http-server'

import { Controller } from '../controller'

@injectable()
export class CreateReservationController extends Controller<
  false,
  z.infer<typeof CreateReservationController.bodySchema>
> {
  constructor(private useCase: ReservationCreator, @inject('Logger') logger: Logger) {
    super(logger)
  }

  static bodySchema = z.object({
    client_name: z.string().min(3),
    date: z.string().datetime(),
    seats: z.number().gt(0),
  })

  async handle(ctx: KoaContex<false, z.infer<typeof CreateReservationController.bodySchema>>): Promise<void> {
    try {
      const data = ctx.request.body
      const result = await this.useCase.run({
        clientName: new ClientName(data.client_name),
        date: new ReservationDate(new Date(data.date)),
        seats: new PositiveNumber(data.seats),
      })

      return this.ok(ctx.response, result.toPrimitives())
    } catch (error) {
      console.log(error)
      if (error instanceof InvalidArgument) this.badRequest(error.name, error.toJSON())
      if (error instanceof NoCapacity) this.notAcceptable(error.name, error.toJSON())
      throw error
    }
  }
}
