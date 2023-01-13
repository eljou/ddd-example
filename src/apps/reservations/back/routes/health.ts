import { container } from 'tsyringe'

import { HealthController } from '../controllers/health'
import { CustomRouteBuilder } from '../custom-route'

const controller = container.resolve(HealthController)
export const healthRoute = new CustomRouteBuilder<false>({ isPrivate: false }).get('/health', ctx =>
  controller.run(ctx),
)
