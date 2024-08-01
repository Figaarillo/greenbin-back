import { Migrator } from '@mikro-orm/migrations'
import { defineConfig } from '@mikro-orm/postgresql'
import { TsMorphMetadataProvider } from '@mikro-orm/reflection'
import EnvVar from './shared/config/env-var.config'

export default defineConfig({
  dbName: EnvVar.database.name,
  user: EnvVar.database.user,
  host: EnvVar.database.host,
  password: EnvVar.database.password,
  port: EnvVar.database.port,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
  extensions: [Migrator]
})
