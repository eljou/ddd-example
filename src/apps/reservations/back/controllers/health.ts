import fs from 'fs'

import { inject, injectable } from 'tsyringe'

import { Logger } from '@shared/domain/logger'
import { KoaContex } from '@shared/infrastructure/http-server'
import { formatBytes } from '@shared/utility-functions'

import { env } from '../settings'
import { Controller } from './controller'

@injectable()
export class HealthController extends Controller<false> {
  constructor(@inject('Logger') logger: Logger) {
    super(logger)
  }

  async handle(ctx: KoaContex<false>): Promise<void> {
    const packageJsonFile = fs.readFileSync('./package.json', { encoding: 'utf-8' })
    const packageJson = JSON.parse(packageJsonFile)

    function formatUptime(secs: number) {
      const pad = (s: number) => (s < 10 ? '0' : '') + s

      const hours = Math.floor(secs / (60 * 60))
      const minutes = Math.floor((secs % (60 * 60)) / 60)
      const seconds = Math.floor(secs % 60)

      return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
    }

    this.ok(ctx.response, {
      node_version: process.version,
      app_version: `v${packageJson['version']}`,
      memory: Object.entries(process.memoryUsage()).reduce(
        (acc, [key, val]) => ({ ...acc, [key]: formatBytes(val) }),
        {},
      ),
      pid: process.pid,
      uptime: formatUptime(process.uptime()),
      environment: env.NODE_ENV,
      log_level: env.LOG_LEVEL,
    })
  }
}
