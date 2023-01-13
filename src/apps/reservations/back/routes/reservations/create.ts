import { container } from 'tsyringe'

import { CreateReservationController } from '../../controllers/reservations/create-reservation'
import { CustomRouteBuilder } from '../../custom-route'

const controller = container.resolve(CreateReservationController)
export const createRoute = new CustomRouteBuilder<false, typeof CreateReservationController.bodySchema>({
  isPrivate: false,
})
  .setBodySchema(CreateReservationController.bodySchema)
  .post('/', ctx => controller.run(ctx))
