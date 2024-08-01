/* eslint-disable no-console */
import bootstrapApp from './app'
import EnvVar from './shared/config/env-var.config'

/* Main function */
;(async () => {
  const SERVER_PORT = EnvVar.server.port

  try {
    bootstrapApp(SERVER_PORT)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
