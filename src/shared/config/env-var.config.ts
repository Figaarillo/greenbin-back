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

interface Recaptcha {
  secretKey: string
}

interface EmailConfig {
  user: string
  appPassword: string
}

interface Config {
  auth: Auth
  server: ServerConfig
  database: DatabaseConfig
  testDatabase: DatabaseConfig
  recaptcha: Recaptcha
  email: EmailConfig
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

const recaptchaConfig: Recaptcha = {
  secretKey: env.get('RECAPTCHA_SECRET_KEY').required().asString()
}

const emailConfig: EmailConfig = {
  user: env.get('EMAIL_USER').required().asString(),
  appPassword: env.get('EMAIL_APP_PASSWORD').required().asString()
}

const EnvVar: Config = {
  auth: authConfig,
  server: serverConfig,
  database: databaseConfig,
  testDatabase: testDatabaseConfig,
  recaptcha: recaptchaConfig,
  email: emailConfig
}

export default EnvVar
