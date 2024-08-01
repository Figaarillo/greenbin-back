import env from 'env-var'

interface ServerConfig {
  port: number
  nodeEnv: 'development' | 'production' | 'test'
}

interface DatabaseConfig {
  name: string
  user: string
  password: string
  host: string
  port: number
}

interface Config {
  server: ServerConfig
  database: DatabaseConfig
  testDatabase: DatabaseConfig
}

const serverConfig: ServerConfig = {
  port: env.get('SERVER_PORT').required().default(8080).asPortNumber(),
  nodeEnv: env.get('NODE_ENV').required().asEnum(['development', 'production', 'test'])
}

const databaseConfig: DatabaseConfig = {
  name: env.get('DATABASE_NAME').required().asString(),
  user: env.get('DATABASE_USER').required().asString(),
  password: env.get('DATABASE_PASS').required().asString(),
  host: env.get('DATABASE_HOST').required().asString(),
  port: env.get('DATABASE_PORT').required().asPortNumber()
}

const testDatabaseConfig: DatabaseConfig = {
  name: env.get('TEST_DATABASE_NAME').required().asString(),
  user: env.get('TEST_DATABASE_USER').required().asString(),
  password: env.get('TEST_DATABASE_PASS').required().asString(),
  host: env.get('TEST_DATABASE_HOST').required().asString(),
  port: env.get('TEST_DATABASE_PORT').required().asPortNumber()
}

const EnvVar: Config = {
  server: serverConfig,
  database: databaseConfig,
  testDatabase: testDatabaseConfig
}

export default EnvVar
