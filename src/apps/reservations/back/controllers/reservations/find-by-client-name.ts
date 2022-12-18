import { Request, Response } from 'koa'
import { inject, injectable } from 'tsyringe'
import { z } from 'zod'

import { Logger } from '@shared/domain/logger'
import { ByUserReservationsFinder } from '@src/bounded-contexts/reservations/application/by-user-reservations-finder'
import { ClientName } from '@src/bounded-contexts/reservations/domain/value-objects/client-name'
import { InvalidArgument } from '@src/bounded-contexts/shared/domain/errors'

import { Controller } from '../controller'

const inputSchema = z.object({ client_name: z.string(), date: z.string().datetime().optional() })

@injectable()
export class FindByClientNameReservationController extends Controller {
  constructor(private useCase: ByUserReservationsFinder, @inject('Logger') logger: Logger) {
    super(logger)
  }

  async handle(req: Request, res: Response): Promise<void> {
    const parsedResult = inputSchema.safeParse({
      ...(typeof req.body == 'object' ? req.body : {}),
      ...(req.query['date'] ? { date: req.query['date'] } : {}),
    })
    if (!parsedResult.success)
      return this.badRequest('Input validation error', parsedResult.error.flatten().fieldErrors)

    try {
      const results = await this.useCase.run({ clientName: new ClientName(parsedResult.data.client_name) })

      return this.ok(
        res,
        results.map(r => r.toPrimitives()),
      )
    } catch (error) {
      if (error instanceof InvalidArgument) this.badRequest(error.name, error.toJSON())
      throw error
    }
  }
}
