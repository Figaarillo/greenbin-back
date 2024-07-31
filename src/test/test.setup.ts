import { type MikroORM } from '@mikro-orm/postgresql'
import * as dotenv from 'dotenv'
import { type FastifyInstance } from 'fastify'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import bootstrapApp from '../app'

dotenv.config()

let orm: MikroORM
let app: FastifyInstance

beforeAll(async () => {
  const { app: fastify, db } = await bootstrapApp(0, {
    dbName: process.env.TEST_DB_NAME,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    host: process.env.TEST_DB_HOST,
    port: Number(process.env.TEST_DB_PORT),
    allowGlobalContext: true,
    debug: false
  })

  orm = db.orm
  app = fastify

  await orm.getSchemaGenerator().refreshDatabase()
})

afterAll(async () => {
  await orm.close(true)
  await app.close()
})

beforeEach(async () => {
  const generator = orm.getSchemaGenerator()
  await generator.refreshDatabase()
})

afterEach(async () => {
  const generator = orm.getSchemaGenerator()
  await generator.dropSchema()
})

export { orm, app }
