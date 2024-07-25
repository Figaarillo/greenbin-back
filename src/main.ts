/* eslint-disable no-console */
import * as dotenv from 'dotenv'
import bootstrapApp from './app'

dotenv.config()

/* Main */
;(async () => {
  const PORT = Number(process.env.SERVER_PORT)

  try {
    bootstrapApp(PORT)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
