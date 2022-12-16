import Router from 'koa-router'

import { HealthController } from './controllers/health'

const router = new Router()

router.get('/health', async ctx => {
  const controller = new HealthController()
  controller.run(ctx)
})

export default router
