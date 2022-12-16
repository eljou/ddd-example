import { Request, Response } from 'koa'
import { z } from 'zod'

import { PositiveNumber } from '@shared/domain/value-objects/positive-number'
import { ReservationCreator } from '@src/bounded-contexts/reservations/application/reservation-creator'
import { NoCapacity } from '@src/bounded-contexts/reservations/domain/errors/no-capacity'
import { ClientName } from '@src/bounded-contexts/reservations/domain/value-objects/client-name'
import { ReservationDate } from '@src/bounded-contexts/reservations/domain/value-objects/reservation-date'
import { InvalidArgument } from '@src/bounded-contexts/shared/domain/errors'
import { CustomError } from '@src/bounded-contexts/shared/domain/errors/custom-error'

import { Controller } from '../controller'

const bodySchema = z.object({
  client_name: z.string().min(3),
  date: z.string().datetime(),
  seats: z.number().gt(0),
})

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
