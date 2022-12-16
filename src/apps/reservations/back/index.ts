import { WinstonLogger } from '@shared/infrastructure/winston-logger'

import { KoaServer } from './server'

const closeSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGQUIT']

const logger = new WinstonLogger('debug')
KoaServer.create({ productName: 'reservations-backend', port: 8080, logger })
  .setGlobalMiddlewares([
    async (ctx, next) => {
      const start = Date.now()
      await next()
      const ms = Date.now() - start
      ctx.set('X-Response-Time', `${ms}ms`)
    },
  ])
  .boot()
  .then(server => server.start())
  .then(server => {
    closeSignals.forEach(s =>
      process.on(s, async () => {
        await server.stop()
        logger.info('App closed')
        process.exit(0)
      }),
    )
  })
  .catch(logger.error)
