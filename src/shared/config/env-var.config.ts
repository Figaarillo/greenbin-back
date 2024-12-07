import dotenv from 'dotenv'
import env from 'env-var'

dotenv.config()

interface ServerConfig {
  port: number
  host: string
  nodeEnv: 'development' | 'production' | 'test'
}

interface DatabaseConfig {
  name: string
  user: string
  password: string
  host: string
  port: number
}

interface Auth {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: string
  refreshTokenExpiresIn: string
}

interface MetabaseConfig {
  secretKey: string
  siteUrl: string
  port: number
  adminEmail: string
  adminPassword: string
  adminFirstName: string
  adminLastName: string
  allowSignup: boolean
}

interface Config {
  auth: Auth
  server: ServerConfig
  database: DatabaseConfig
  testDatabase: DatabaseConfig
  metabase: MetabaseConfig
}

const serverConfig: ServerConfig = {
  port: env.get('SERVER_PORT').required().default(8080).asPortNumber(),
  host: env.get('SERVER_HOST').required().asString(),
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

const authConfig: Auth = {
  accessToken: env.get('ACCESS_TOKEN').required().asString(),
  refreshToken: env.get('REFRESH_TOKEN').required().asString(),
  accessTokenExpiresIn: env.get('ACCESS_TOKEN_EXPIRES_IN').required().asString(),
  refreshTokenExpiresIn: env.get('REFRESH_TOKEN_EXPIRES_IN').required().asString()
}

const metabaseConfig: MetabaseConfig = {
  secretKey: env.get('METABASE_SECRET_KEY').required().asString(),
  siteUrl: env.get('METABASE_SITE_URL').required().asString(),
  port: env.get('METABASE_PORT').required().asPortNumber(),
  adminEmail: env.get('METABASE_ADMIN_EMAIL').required().asString(),
  adminPassword: env.get('METABASE_ADMIN_PASSWORD').required().asString(),
  adminFirstName: env.get('METABASE_ADMIN_FIRST_NAME').required().asString(),
  adminLastName: env.get('METABASE_ADMIN_LAST_NAME').required().asString(),
  allowSignup: env.get('METABASE_ALLOW_SIGNUP').required().asBool()
}

const EnvVar: Config = {
  auth: authConfig,
  server: serverConfig,
  database: databaseConfig,
  testDatabase: testDatabaseConfig,
  metabase: metabaseConfig
}

export default EnvVar
