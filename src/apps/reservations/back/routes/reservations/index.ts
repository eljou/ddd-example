import Router from 'koa-router'

import { registerCreateRoute } from './create'
import { registerFindByClientNameRoute } from './find-by-client-name'

const router = new Router()

registerCreateRoute(router)
registerFindByClientNameRoute(router)

export default router
