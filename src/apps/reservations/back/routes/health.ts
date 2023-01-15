import { container } from 'tsyringe'

import { CustomRouteBuilder } from '@shared/infrastructure/http-server'

import { HealthController } from '../controllers/health'

const controller = container.resolve(HealthController)
export const healthRoute = new CustomRouteBuilder<false>({ isPrivate: false }).get('/health', ctx =>
  controller.run(ctx),
)
