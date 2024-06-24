/* eslint-disable n/no-path-concat */
import { DataSource, type DataSourceOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import * as dotenv from 'dotenv'

dotenv.config()

const DatabaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  migrationsRun: true,
  logging: true,
  entities: [`${__dirname}/../../../**/*.entity{.ts,.js}`],
  migrations: [`${__dirname}/../../migrations/*{.ts, .js}`],
  namingStrategy: new SnakeNamingStrategy()
}

export default new DataSource(DatabaseConfig)
