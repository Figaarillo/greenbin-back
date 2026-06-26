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
const EnvVar = {
    auth: authConfig,
    server: serverConfig,
    database: databaseConfig,
    testDatabase: testDatabaseConfig,
    recaptcha: recaptchaConfig,
    email: emailConfig
};
exports.default = EnvVar;
