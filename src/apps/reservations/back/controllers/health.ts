import fs from 'fs'

import { Request, Response } from 'koa'

import { env } from '../settings'
import { Controller } from './controller'

export class HealthController extends Controller {
  async handle(req: Request, res: Response): Promise<void> {
    const packageJsonFile = fs.readFileSync('./package.json', { encoding: 'utf-8' })
    const packageJson = JSON.parse(packageJsonFile)

    function formatUptime(secs: number) {
      const pad = (s: number) => (s < 10 ? '0' : '') + s

      const hours = Math.floor(secs / (60 * 60))
      const minutes = Math.floor((secs % (60 * 60)) / 60)
      const seconds = Math.floor(secs % 60)

      return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
    }

    function formatBytes(n: number): string {
      const k = n > 0 ? Math.floor(Math.log2(n) / 10) : 0
      const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'b'
      return `${(n / Math.pow(1024, k)).toFixed(2)} ${rank}`
    }

    this.ok(res, {
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
