/* eslint-disable no-console */
import fastifyAuth from '@fastify/auth'
import FastifyCors from '@fastify/cors'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import { RequestContext, type Options } from '@mikro-orm/postgresql'
import { type FastifyInstance } from 'fastify'
import bootstrapAuth from './auth/auth.bootstrap'
import initMikroORM, { type Services } from './db'
import bootstrapEntity from './entity/entity.bootstrap'
import bootstrapGreenPoint from './green-point/green-point.bootstrap'
import bootstrapNeighbor from './neighbor/neighbor.bootstrap'
import bootstrapResponsible from './responsible/responsible.bootstrap'
import bootstrapRewardPartner from './reward-partner/reward-partner.bootstrap'
import EnvVar from './shared/config/env-var.config'
import { FastifyCorsConfig } from './shared/config/fastify-cors.config'
import FastifyConifg from './shared/config/fastify.config'
import { SwaggerConfig, SwaggerUiConfig } from './shared/config/swagger.config'
import bootstrapWasteCategory from './waste-category/waste-category.bootstrap'
import bootstrapWasteTransactionDetail from './waste-transaction-detail/waste-transaction-detail.bootstrap'
import bootstrapWasteTransaction from './waste-transaction/waste-transaction.bootstrap'
import bootstrapWaste from './waste/waste.bootstrap'
import jwt from 'jsonwebtoken'

async function bootstrapApp(port: number, options?: Options): Promise<{ app: FastifyInstance; db: Services }> {
  const db = await initMikroORM(options)
  const fastify = new FastifyConifg(EnvVar.server.nodeEnv === 'development')
  const app = fastify.server

  /* Register Swagger */
  await app.register(Swagger, SwaggerConfig)
  await app.register(SwaggerUI, SwaggerUiConfig)

  /* Register CORS */
  app.register(FastifyCors, FastifyCorsConfig)

  /* Register plugins */
  await app.register(fastifyAuth)

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

  /* Add Metabase endpoint */
  app.get('/metabase-dashboard', async (request, reply) => {
    const { id } = request.query as { id?: string }; 
    if (!id) {
      return reply.status(400).send({ error: 'ID is required' });
    }
  
    const METABASE_SITE_URL = "http://localhost:3000";
    const METABASE_SECRET_KEY ="e133c6146faa73cbf9aa5be19e837d941ede38da29db7aae7103d12c2271fbdc";
  
    const payload = {
      resource: { dashboard: 2 },
      params: { id: [id] }, // Incluir el ID en los parámetros
      exp: Math.round(Date.now() / 1000) + (10 * 60), // 10 minutos de expiración
    };
  
    const token = jwt.sign(payload, METABASE_SECRET_KEY);
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;
  
    return { iframeUrl };
  });
  

  /* Register the entities */
  bootstrapAuth(app)
  bootstrapEntity(app)
  bootstrapWasteCategory(app)
  bootstrapResponsible(app)
  bootstrapNeighbor(app)
  bootstrapRewardPartner(app)
  bootstrapGreenPoint(app)
  bootstrapWaste(app)
  bootstrapWasteTransaction(app)
  bootstrapWasteTransactionDetail(app)

  /* Start the server */
  const url: string = await fastify.start(port)
  console.log(`Server is running!🔥 Go to ${url}`)

  return { app, db }
}

export default bootstrapApp
