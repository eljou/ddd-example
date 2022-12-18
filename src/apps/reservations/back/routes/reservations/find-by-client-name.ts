import Router from 'koa-router'
import { container } from 'tsyringe'

import { FindByClientNameReservationController } from '../../controllers/reservations/find-by-client-name'

export function registerFindByClientNameRoute(router: Router): Router {
  const controller = container.resolve(FindByClientNameReservationController)

  router.get('/', async ctx => controller.run(ctx))

  return router
}
