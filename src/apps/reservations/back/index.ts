import { KoaServer } from './server'

const closeSignals = ['SIGTERM', 'SIGINT', 'SIGUSR2', 'SIGQUIT']

KoaServer.create('reservations-backend', 8080)
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
        console.log('App closed')
        process.exit(0)
      }),
    )
  })
  .catch(console.error)
