import { container } from 'tsyringe'

import { CustomRouteBuilder } from '@shared/infrastructure/http-server'

import { FindByClientNameReservationController } from '../../controllers/reservations/find-by-client-name'

const controller = container.resolve(FindByClientNameReservationController)
export const findByClientNameRoute = new CustomRouteBuilder<
  false,
  typeof FindByClientNameReservationController.bodySchema
>({ isPrivate: false })
  .setBodySchema(FindByClientNameReservationController.bodySchema)
  .get('/', ctx => controller.run(ctx))
