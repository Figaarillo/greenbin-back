/* eslint-disable no-console */

// eslint-disable-next-line sort-imports
import 'module-alias/register' // Must be import this module first

import * as dotenv from 'dotenv'
import bootstrapApp from './app'

dotenv.config()

/* Main */
;(async () => {
  const PORT = Number(process.env.PORT)

  try {
    bootstrapApp(PORT)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
