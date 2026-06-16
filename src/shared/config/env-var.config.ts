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

interface CorsConfig {
  allowedOrigins: string[]
}

interface AdminConfig {
  email: string
  password: string
}

interface Config {
  auth: Auth
  server: ServerConfig
  database: DatabaseConfig
  testDatabase: DatabaseConfig
  recaptcha: Recaptcha
  email: EmailConfig
  cors: CorsConfig
  admin: AdminConfig
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

// In production, CORS origins MUST be provided explicitly (no wildcard, no localhost defaults):
// env-var only throws on a missing required var when no default is set, so production omits the default.
// In development/test we fall back to localhost so the local frontend works out of the box.
const corsConfig: CorsConfig = {
  allowedOrigins:
    serverConfig.nodeEnv === 'production'
      ? env.get('CORS_ALLOWED_ORIGINS').required().asArray(',')
      : env.get('CORS_ALLOWED_ORIGINS').default('localhost,127.0.0.1').asArray(',')
}

// Admin credentials must be provided explicitly via env — never hardcode a default
// password in source. The seeder consumes these; without them the app fails fast.
const adminConfig: AdminConfig = {
  email: env.get('ADMIN_EMAIL').required().asString(),
  password: env.get('ADMIN_PASSWORD').required().asString()
}

const EnvVar: Config = {
  auth: authConfig,
  server: serverConfig,
  database: databaseConfig,
  testDatabase: testDatabaseConfig,
  recaptcha: recaptchaConfig,
  email: emailConfig,
  cors: corsConfig,
  admin: adminConfig
}

export default EnvVar
