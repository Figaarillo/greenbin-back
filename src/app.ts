/* eslint-disable no-console */
import FastifyCors from '@fastify/cors'
import { type Options, RequestContext } from '@mikro-orm/postgresql'
import * as dotenv from 'dotenv'
import { type FastifyInstance } from 'fastify'
import initMikroORM, { type Services } from './db'
import bootstrapEntity from './entity/entity.bootstrap'
import bootstrapResponsible from './responsible/responsible.bootstrap'
import { FastifyCorsConfig } from './shared/config/fastify-cors.config'
import FastifyConifg from './shared/config/fastify.config'
import bootstrapWasteCategory from './waste-category/waste-category.bootstrap'

dotenv.config()

async function bootstrapApp(port: number, options?: Options): Promise<{ app: FastifyInstance; db: Services }> {
  const db = await initMikroORM(options)
  const fastify = new FastifyConifg(process.env.NODE_ENV === 'development')
  const app = fastify.server

  /* Register CORS */
  app.register(FastifyCors, FastifyCorsConfig)

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
