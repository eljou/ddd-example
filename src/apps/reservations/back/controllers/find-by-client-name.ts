import { Request, Response } from 'koa'
import { injectable } from 'tsyringe'
import { z } from 'zod'

import { ByUserReservationsFinder } from '@src/bounded-contexts/reservations/application/by-user-reservations-finder'
import { ClientName } from '@src/bounded-contexts/reservations/domain/value-objects/client-name'

import { Controller } from './controller'

const bodySchema = z.object({ client_name: z.string() })

@injectable()
export class FindByClientNameReservationController extends Controller {
  constructor(private useCase: ByUserReservationsFinder) {
    super()
  }

  async handle(req: Request, res: Response): Promise<void> {
    const parsedResult = bodySchema.safeParse(req.body)
    if (!parsedResult.success)
      return this.badRequest('Input validation error', parsedResult.error.flatten().fieldErrors)

    const results = await this.useCase.run({ clientName: new ClientName(parsedResult.data.client_name) })

    return this.ok(
      res,
      results.map(r => r.toPrimitives()),
    )
  }
}
