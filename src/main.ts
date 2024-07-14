/* eslint-disable no-console */

// eslint-disable-next-line sort-imports
import 'module-alias/register' // Must be import this module first

import BootstrapEntity from '@entity/entity.bootstrap'
import FastifyConifg from '@shared/config/fastify.config'
import AppDataSource from '@shared/config/typeorm.config'
import BootstrapUser from '@user/user.bootstrap'
import * as dotenv from 'dotenv'
import { type DataSource } from 'typeorm'

dotenv.config()
const PORT = Number(process.env.PORT)

/* Main */
;(async () => {
  try {
    const dataSource: DataSource = AppDataSource
    const db = await initDBConnection(dataSource)

    const fastifyConfig = new FastifyConifg()
    const fastify = await fastifyConfig.server

    BootstrapUser(db, fastify)
    BootstrapEntity(db, fastify)

    fastify.get('/', async () => {
      return 'Hello, World!'
    })
    await fastifyConfig.start()
    console.log(`Server is running!🔥 Go to http://localhost:${PORT}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

async function initDBConnection(dataSource: DataSource): Promise<DataSource> {
  const connection = await dataSource.initialize()
  // eslint-disable-next-line no-console
  console.log('Successfully connected to database! 🚀')
  return connection
}
