"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrations_1 = require("@mikro-orm/migrations");
const postgresql_1 = require("@mikro-orm/postgresql");
const reflection_1 = require("@mikro-orm/reflection");
const env_var_config_js_1 = __importDefault(require("./shared/config/env-var.config.js"));
exports.default = (0, postgresql_1.defineConfig)({
    dbName: env_var_config_js_1.default.database.name,
    user: env_var_config_js_1.default.database.user,
    host: env_var_config_js_1.default.database.host,
    password: env_var_config_js_1.default.database.password,
    port: env_var_config_js_1.default.database.port,
    entities: ['./dist/**/*.entity.js'],
    entitiesTs: ['./src/**/*.entity.ts'],
    metadataProvider: reflection_1.TsMorphMetadataProvider,
    debug: true,
    extensions: [migrations_1.Migrator],
    migrations: {
        safe: true
    }
});
