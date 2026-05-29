/* eslint-disable no-console */
import fastifyAuth from '@fastify/auth'
import FastifyCors from '@fastify/cors'
import Swagger from '@fastify/swagger'
import SwaggerUI from '@fastify/swagger-ui'
import { RequestContext, type Options } from '@mikro-orm/postgresql'
import { type FastifyInstance } from 'fastify'
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
import bootstrapStatistics from './statistics/statistics.bootstrap'
import bootstrapPasswordReset from './auth/password-reset.bootstrap'
import errorMiddleware from './shared/infrastructure/middlewares/error.middleware'
import runSeeders from './shared/database/seeders/database.seeder'

async function bootstrapApp(port: number, options?: Options): Promise<{ app: FastifyInstance; db: Services }> {
  const db = await initMikroORM(options)

  /* Run pending migrations once on startup (skipped in tests, which manage schema directly) */
  if (EnvVar.server.nodeEnv !== 'test') {
    await db.orm.getMigrator().up()
  }

  if (EnvVar.server.nodeEnv === 'development') {
    await runSeeders(db.em)
  }
  const fastify = new FastifyConifg(EnvVar.server.nodeEnv)
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
  bootstrapStatistics(app)
  bootstrapPasswordReset(app)

  app.setErrorHandler(errorMiddleware)

  /* Start the server */
  const url: string = await fastify.start(port)
  console.log(`Server is running!🔥 Go to ${url}`)

  return { app, db }
}

export default bootstrapApp
