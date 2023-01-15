import { container } from 'tsyringe'

import { CustomRouteBuilder } from '@shared/infrastructure/http-server'

import { CreateReservationController } from '../../controllers/reservations/create-reservation'

const controller = container.resolve(CreateReservationController)
export const createRoute = new CustomRouteBuilder<false, typeof CreateReservationController.bodySchema>({
  isPrivate: false,
})
  .setBodySchema(CreateReservationController.bodySchema)
  .post('/', ctx => controller.run(ctx))
