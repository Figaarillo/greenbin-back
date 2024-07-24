import { type FastifyInstance } from 'fastify'
import initMikroORM, { type Services } from './db'
import FastifyConifg from '@shared/config/fastify.config'
import { RequestContext } from '@mikro-orm/core'
import bootstrapEntity from '@entity/entity.bootstrap'

async function bootstrapApp(port: number): Promise<{ app: FastifyInstance; db: Services }> {
  const db = await initMikroORM()

  const fastify = new FastifyConifg()
  const app = fastify.server

  app.addHook('onRequest', (_req, _rep, done) => {
    RequestContext.create(db.em, done)
  })

  app.addHook('onClose', async () => {
    await db.orm.close()
  })

  app.get('/', async () => {
    return 'Hello, World!'
  })

  bootstrapEntity(app, db)

  const url: string = await fastify.start(port)

  // eslint-disable-next-line no-console
  console.log(`Server is running!🔥 Go to ${url}`)

  return { app, db }
}

export default bootstrapApp
