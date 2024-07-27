/* eslint-disable no-console */
import { RequestContext } from '@mikro-orm/core'
import { type FastifyInstance } from 'fastify'
import initMikroORM, { type Services } from './db'
import bootstrapEntity from './entity/entity.bootstrap'
import FastifyConifg from './shared/config/fastify.config'
import bootstrapWasteCategory from './waste-category/waste-category.bootstrap'
import bootstrapResponsible from './responsible/responsible.bootstrap'

async function bootstrapApp(port: number): Promise<{ app: FastifyInstance; db: Services }> {
  const db = await initMikroORM()
  const fastify = new FastifyConifg()
  const app = fastify.server

  /* Add hooks */
  app.addHook('onRequest', (_req, _rep, done) => {
    RequestContext.create(db.em, done)
  })

  app.addHook('onClose', async () => {
    await db.orm.close()
  })

  app.get('/', async () => {
    return 'Hello, World!'
  })

  /* Register the entities */
  bootstrapEntity(app, db)
  bootstrapWasteCategory(app, db)
  bootstrapResponsible(app, db)

  /* Start the server */
  const url: string = await fastify.start(port)
  console.log(`Server is running!🔥 Go to ${url}`)

  return { app, db }
}

export default bootstrapApp
