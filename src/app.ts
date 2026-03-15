/* eslint-disable no-console */
import fastifyAuth from '@fastify/auth'
import FastifyCors from '@fastify/cors'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import { RequestContext, type Options } from '@mikro-orm/postgresql'
import env from 'env-var'
import { type FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import bootstrapAuth from './auth/auth.bootstrap'
import bootstrapCouponTransaction from './coupon-transaction/coupon-transaction.bootstrap'
import bootstrapCoupon from './coupon/coupon.bootstrap'
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

  app.get('/metabase', async (request, reply) => {
    const { id } = request.query as { id?: string }
    if (id === undefined || id === null || id === '') {
      return await reply.status(400).send({ error: 'ID is required' })
    }
    const payload = {
      resource: { dashboard: 2 },
      params: { id: [id] },
      exp: Math.round(Date.now() / 1000) + 10 * 60 // 10 minutos de expiración
    }
    const token = jwt.sign(payload, env.get('METABASE_SECRET_KEY').required().asString())
    const iframeUrl = `${env
      .get('METABASE_SITE_URL')
      .required()
      .asString()}/embed/dashboard/${token}#bordered=true&titled=true`

    return { iframeUrl }
  })

  app.get('/metabase/neighbor', async (_request, _reply) => {
    const payload = {
      resource: { dashboard: 3 },
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60 // 10 minute expiration
    }
    const token = jwt.sign(payload, env.get('METABASE_SECRET_KEY').required().asString())
    const iframeUrl = `${env
      .get('METABASE_SITE_URL')
      .required()
      .asString()}/embed/dashboard/${token}#bordered=true&titled=true`

    return { iframeUrl }
  })

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
  bootstrapCoupon(app)
  bootstrapCouponTransaction(app)

  /* Start the server */
  const url: string = await fastify.start(port)
  console.log(`Server is running!🔥 Go to ${url}`)

  return { app, db }
}

export default bootstrapApp
