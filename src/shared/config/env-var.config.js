"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const env_var_1 = __importDefault(require("env-var"));
dotenv_1.default.config();
const serverConfig = {
    port: env_var_1.default.get('SERVER_PORT').required().default(8080).asPortNumber(),
    host: env_var_1.default.get('SERVER_HOST').required().asString(),
    nodeEnv: env_var_1.default.get('NODE_ENV').required().asEnum(['development', 'production', 'test'])
};
const databaseConfig = {
    name: env_var_1.default.get('DATABASE_NAME').required().asString(),
    user: env_var_1.default.get('DATABASE_USER').required().asString(),
    password: env_var_1.default.get('DATABASE_PASS').required().asString(),
    host: env_var_1.default.get('DATABASE_HOST').required().asString(),
    port: env_var_1.default.get('DATABASE_PORT').required().asPortNumber()
};
const testDatabaseConfig = {
    name: env_var_1.default.get('TEST_DATABASE_NAME').required().asString(),
    user: env_var_1.default.get('TEST_DATABASE_USER').required().asString(),
    password: env_var_1.default.get('TEST_DATABASE_PASS').required().asString(),
    host: env_var_1.default.get('TEST_DATABASE_HOST').required().asString(),
    port: env_var_1.default.get('TEST_DATABASE_PORT').required().asPortNumber()
};
const authConfig = {
    accessToken: env_var_1.default.get('ACCESS_TOKEN').required().asString(),
    refreshToken: env_var_1.default.get('REFRESH_TOKEN').required().asString(),
    accessTokenExpiresIn: env_var_1.default.get('ACCESS_TOKEN_EXPIRES_IN').required().asString(),
    refreshTokenExpiresIn: env_var_1.default.get('REFRESH_TOKEN_EXPIRES_IN').required().asString()
};
const recaptchaConfig = {
    secretKey: env_var_1.default.get('RECAPTCHA_SECRET_KEY').required().asString()
};
const emailConfig = {
    user: env_var_1.default.get('EMAIL_USER').required().asString(),
    appPassword: env_var_1.default.get('EMAIL_APP_PASSWORD').required().asString()
};
// In production, CORS origins MUST be provided explicitly (no wildcard, no localhost defaults):
// env-var only throws on a missing required var when no default is set, so production omits the default.
// In development/test we fall back to localhost so the local frontend works out of the box.
const corsConfig = {
    allowedOrigins: serverConfig.nodeEnv === 'production'
        ? env_var_1.default.get('CORS_ALLOWED_ORIGINS').required().asArray(',')
        : env_var_1.default.get('CORS_ALLOWED_ORIGINS').default('localhost,127.0.0.1').asArray(',')
};
// Admin credentials must be provided explicitly via env — never hardcode a default
// password in source. The seeder consumes these; without them the app fails fast.
const adminConfig = {
    email: env_var_1.default.get('ADMIN_EMAIL').required().asString(),
    password: env_var_1.default.get('ADMIN_PASSWORD').required().asString()
};
const EnvVar = {
    auth: authConfig,
    server: serverConfig,
    database: databaseConfig,
    testDatabase: testDatabaseConfig,
    recaptcha: recaptchaConfig,
    email: emailConfig,
    cors: corsConfig,
    admin: adminConfig
};
exports.default = EnvVar;
//# sourceMappingURL=env-var.config.js.map