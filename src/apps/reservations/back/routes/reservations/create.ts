import Router from 'koa-router'
import { container } from 'tsyringe'

import { CreateReservationController } from '../../controllers/reservations/create-reservation'

export function registerCreateRoute(router: Router): Router {
  const controller = container.resolve(CreateReservationController)

  router.post('/', ctx => controller.run(ctx))

  return router
}
