/* // eslint-disable-next-line import/no-named-as-default
import Redis from 'ioredis'

const subscriber = new Redis({ lazyConnect: true, maxRetriesPerRequest: 5 })
const publisher = new Redis({ lazyConnect: true, maxRetriesPerRequest: 5 })

async function main() {
  await subscriber.connect()
  subscriber.subscribe('test.topic', (err, some) => {
    if (err) throw err
    console.log(some)

    subscriber.subscribe('test.topic2', (err, some) => {
      if (err) throw err
      console.log(some)

      subscriber.on('message', (channel, msg) => {
        console.log(`got message on CH: ${channel}: ${msg}`)
      })
    })
  })

  await publisher.connect()
  await publisher.publish('test.topic', 'hello world 1')
  await publisher.publish('test.topic2', 'hello world 2')

  publisher.disconnect()
  console.log('finished')
}

main()
 */
