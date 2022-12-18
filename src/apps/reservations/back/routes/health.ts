import Router from 'koa-router'
import { container } from 'tsyringe'

import { HealthController } from '../controllers/health'

const router = new Router()
const controller = container.resolve(HealthController)

router.get('/health', async ctx => {
  controller.run(ctx)
})

export default router
