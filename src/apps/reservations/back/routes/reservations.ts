import Router from 'koa-router'
import { container } from 'tsyringe'

import { CreateReservationController } from './controllers/create-reservation'

const router = new Router()
const controller = container.resolve(CreateReservationController)

router.post('/reservation', async ctx => {
  await controller.run(ctx)
})

export default router
