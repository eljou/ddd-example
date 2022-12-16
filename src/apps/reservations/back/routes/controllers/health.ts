import { Request, Response } from 'koa'

import { Controller } from '../controller'

export class HealthController extends Controller {
  async handle(req: Request, res: Response): Promise<void> {
    this.ok(res, {
      node_version: process.version,
      memory: process.memoryUsage(),
      pid: process.pid,
      uptime: process.uptime(),
      environment: 'dev',
    })
  }
}
