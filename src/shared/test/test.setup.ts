import { type MikroORM } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import * as dotenv from 'dotenv'
import { type FastifyInstance } from 'fastify'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import bootstrapApp from '../../app'

dotenv.config()

let orm: MikroORM
let app: FastifyInstance

beforeAll(async () => {
  const { app: fastify, db } = await bootstrapApp(0, {
    dbName: process.env.TEST_DATABASE_NAME,
    user: process.env.TEST_DATABASE_USER,
    host: process.env.TEST_DATABASE_HOST,
    password: process.env.TEST_DATABASE_PASS,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    port: Number(process.env.TEST_DATABASE_PORT),
    metadataProvider: TsMorphMetadataProvider,
    debug: false,
    dynamicImportProvider: async id => await import(id)
  })

  orm = db.orm
  app = fastify

  await orm.getSchemaGenerator().refreshDatabase()
})

afterAll(async () => {
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

export { app, orm }
