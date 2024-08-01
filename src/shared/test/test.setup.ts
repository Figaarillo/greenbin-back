import { type MikroORM } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import * as dotenv from 'dotenv'
import { type FastifyInstance } from 'fastify'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import bootstrapApp from '../../app'
import EnvVar from '../config/env-var.config'

dotenv.config()

let orm: MikroORM
let app: FastifyInstance

beforeAll(async () => {
  const { app: fastify, db } = await bootstrapApp(0, {
    dbName: EnvVar.testDatabase.name,
    user: EnvVar.testDatabase.user,
    password: EnvVar.testDatabase.password,
    host: EnvVar.testDatabase.host,
    port: EnvVar.testDatabase.port,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
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
