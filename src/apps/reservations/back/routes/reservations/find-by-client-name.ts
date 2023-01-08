import { container } from 'tsyringe'

import { FindByClientNameReservationController } from '../../controllers/reservations/find-by-client-name'
import { CustomRouteBuilder } from '../../custom-route'

const controller = container.resolve(FindByClientNameReservationController)
export const findByClientNameRoute = new CustomRouteBuilder<
  false,
  typeof FindByClientNameReservationController.bodySchema
>({ isPrivate: false })
  .setBodySchema(FindByClientNameReservationController.bodySchema)
  .get('/', controller.run)
