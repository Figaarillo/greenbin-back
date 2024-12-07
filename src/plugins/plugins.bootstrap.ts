import { type FastifyInstance } from 'fastify'
import type IJWTStrategy from '../auth/domain/strategies/jwt.interface.strategy'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'
import MetabaseRoute from './infrastructure/routes/metabase.route'

async function bootstrapMetabase(app: FastifyInstance): Promise<void> {
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  const metabaseRoute = new MetabaseRoute(app, jwtStrategy)
  metabaseRoute.setup()
}

export default bootstrapMetabase
