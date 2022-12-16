import Router from 'koa-router'

import { ReservationCreator } from '@reservations/application/reservation-creator'
import { FileReservationRepository } from '@reservations/infrastructure/persistance/file-reservation-repository'

import { CreateReservationController } from './controllers/create-reservation'

const router = new Router()

router.post('/reservation', async ctx => {
  const repo = new FileReservationRepository()
  const useCase = new ReservationCreator(repo)
  const controller = new CreateReservationController(useCase)
  await controller.run(ctx)
})

export default router
