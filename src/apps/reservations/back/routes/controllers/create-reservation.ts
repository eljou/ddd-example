import { Request, Response } from 'koa'
import { injectable } from 'tsyringe'
import { z } from 'zod'

import { ReservationCreator } from '@reservations/application/reservation-creator'
import { NoCapacity } from '@reservations/domain/errors/no-capacity'
import { ClientName } from '@reservations/domain/value-objects/client-name'
import { ReservationDate } from '@reservations/domain/value-objects/reservation-date'
import { InvalidArgument } from '@shared/domain/errors'
import { CustomError } from '@shared/domain/errors/custom-error'
import { PositiveNumber } from '@shared/domain/value-objects/positive-number'

import { Controller } from '../controller'

const bodySchema = z.object({
  client_name: z.string().min(3),
  date: z.string().datetime(),
  seats: z.number().gt(0),
})

@injectable()
export class CreateReservationController extends Controller {
  constructor(private useCase: ReservationCreator) {
    super()
  }

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const parsedResult = bodySchema.safeParse(req.body)
      if (!parsedResult.success)
        return this.badRequest('Input validation error', parsedResult.error.flatten().fieldErrors)

      const { data } = parsedResult
      const result = await this.useCase.run({
        clientName: new ClientName(data.client_name),
        date: new ReservationDate(new Date(data.date)),
        seats: new PositiveNumber(data.seats),
      })

      return this.ok(res, result.toPrimitives())
    } catch (error) {
      if (error instanceof InvalidArgument) this.badRequest(error.name, error.toJSON())
      if (error instanceof NoCapacity) this.notAcceptable(error.name, error.toJSON())
      if (error instanceof CustomError) this.badRequest(error.name, error.toJSON())
    }
  }
}
