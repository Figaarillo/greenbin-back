import dotenv from 'dotenv'
import env from 'env-var'

dotenv.config()

interface ServerConfig {
  port: number
  host: string
  nodeEnv: 'development' | 'production' | 'test' | 'staging'
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

interface AfipConfig {
  accessToken: string
  cuitRepresentada: string
  environment: string
}

interface EmailConfig {
  provider: 'nodemailer' | 'resend'
  from: string
  user: string
  appPassword: string
  resendApiKey: string
}

interface PushConfig {
  publicKey: string
  privateKey: string
  contactEmail: string
}

interface CorsConfig {
  allowedOrigins: string[]
}

interface AdminConfig {
  email: string
  password: string
}

interface ProdEntityConfig {
  name: string
  email: string
  description: string
  password: string
  city: string
  province: string
  latitude: number
  longitude: number
}

interface Config {
  auth: Auth
  server: ServerConfig
  database: DatabaseConfig
  testDatabase: DatabaseConfig
  recaptcha: Recaptcha
  email: EmailConfig
  push: PushConfig
  cors: CorsConfig
  admin: AdminConfig
  prodEntity: ProdEntityConfig
  afip: AfipConfig
}

const serverConfig: ServerConfig = {
  port: env.get('SERVER_PORT').required().default(8080).asPortNumber(),
  host: env.get('SERVER_HOST').required().asString(),
  nodeEnv: env.get('NODE_ENV').required().asEnum(['development', 'production', 'test', 'staging'])
}

const databaseConfig: DatabaseConfig = {
  name: env.get('DATABASE_NAME').required().asString(),
  user: env.get('DATABASE_USER').required().asString(),
  password: env.get('DATABASE_PASS').required().asString(),
  host: env.get('DATABASE_HOST').required().asString(),
  port: env.get('DATABASE_PORT').required().asPortNumber()
}

// The test database only exists in development/test. In production these vars
// are never set (and the app never touches the test DB), so requiring them
// would crash a perfectly valid prod boot. Outside production we keep them
// required to fail fast when a local/test env is misconfigured.
function loadTestDatabaseConfig(): DatabaseConfig {
  if (serverConfig.nodeEnv === 'production' || serverConfig.nodeEnv === 'staging') {
    return { name: '', user: '', password: '', host: '', port: 0 }
  }

  return {
    name: env.get('TEST_DATABASE_NAME').required().asString(),
    user: env.get('TEST_DATABASE_USER').required().asString(),
    password: env.get('TEST_DATABASE_PASS').required().asString(),
    host: env.get('TEST_DATABASE_HOST').required().asString(),
    port: env.get('TEST_DATABASE_PORT').required().asPortNumber()
  }
}

const testDatabaseConfig: DatabaseConfig = loadTestDatabaseConfig()

const authConfig: Auth = {
  accessToken: env.get('ACCESS_TOKEN').required().asString(),
  refreshToken: env.get('REFRESH_TOKEN').required().asString(),
  accessTokenExpiresIn: env.get('ACCESS_TOKEN_EXPIRES_IN').required().asString(),
  refreshTokenExpiresIn: env.get('REFRESH_TOKEN_EXPIRES_IN').required().asString()
}

const recaptchaConfig: Recaptcha = {
  secretKey: env.get('RECAPTCHA_SECRET_KEY').required().asString()
}

// Railway (y otros PaaS) bloquean el trafico SMTP saliente, asi que en produccion
// hay que enviar por la API HTTP de Resend en vez de nodemailer/Gmail. El
// provider default sigue siendo nodemailer para no romper dev/tests existentes;
// cada set de credenciales solo se exige cuando su provider esta activo.
function loadEmailConfig(): EmailConfig {
  const provider = env.get('EMAIL_PROVIDER').default('nodemailer').asEnum(['nodemailer', 'resend'])

  return {
    provider,
    from: env.get('EMAIL_FROM').default('GreenBin <onboarding@resend.dev>').asString(),
    user:
      provider === 'nodemailer'
        ? env.get('EMAIL_USER').required().asString()
        : env.get('EMAIL_USER').default('').asString(),
    appPassword:
      provider === 'nodemailer'
        ? env.get('EMAIL_APP_PASSWORD').required().asString()
        : env.get('EMAIL_APP_PASSWORD').default('').asString(),
    resendApiKey:
      provider === 'resend'
        ? env.get('RESEND_API_KEY').required().asString()
        : env.get('RESEND_API_KEY').default('').asString()
  }
}

const emailConfig: EmailConfig = loadEmailConfig()

const pushConfig: PushConfig = {
  publicKey: env.get('VAPID_PUBLIC_KEY').required().asString(),
  privateKey: env.get('VAPID_PRIVATE_KEY').required().asString(),
  contactEmail: env.get('VAPID_CONTACT_EMAIL').default(emailConfig.user).asString()
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

// Entity config for production bootstrap. All have sensible defaults so the admin
// can log in and update entity details later via the API. Only override if you
// need a specific entity name or location from the first deploy.
const prodEntityConfig: ProdEntityConfig = {
  name: env.get('PROD_ENTITY_NAME').default('Administración').asString(),
  email: env.get('PROD_ENTITY_EMAIL').default(adminConfig.email).asString(),
  description: env.get('PROD_ENTITY_DESCRIPTION').default('Entidad inicial del sistema').asString(),
  password: env.get('PROD_ENTITY_PASSWORD').default(adminConfig.password).asString(),
  city: env.get('PROD_ENTITY_CITY').default('Ciudad').asString(),
  province: env.get('PROD_ENTITY_PROVINCE').default('Provincia').asString(),
  latitude: env.get('PROD_ENTITY_LAT').default('-31.42').asFloat(),
  longitude: env.get('PROD_ENTITY_LNG').default('-62.08').asFloat()
}

const afipConfig: AfipConfig = {
  accessToken: env.get('AFIP_ACCESS_TOKEN').required().asString(),
  cuitRepresentada: env.get('AFIP_CUIT_REPRESENTADA').required().asString(),
  environment: env.get('AFIP_ENVIRONMENT').default('dev').asString()
}

const EnvVar: Config = {
  auth: authConfig,
  server: serverConfig,
  database: databaseConfig,
  testDatabase: testDatabaseConfig,
  recaptcha: recaptchaConfig,
  email: emailConfig,
  push: pushConfig,
  cors: corsConfig,
  admin: adminConfig,
  prodEntity: prodEntityConfig,
  afip: afipConfig
}

export default EnvVar
