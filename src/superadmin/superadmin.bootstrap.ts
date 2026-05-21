import { type FastifyInstance } from 'fastify'
import type IJWTStrategy from '../auth/domain/strategies/jwt.interface.strategy'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'
import SuperadminHandler from './infrastructure/handlers/superadmin.handler'
import SuperadminRoute from './infrastructure/routes/superadmin.route'

function bootstrapSuperadmin(app: FastifyInstance): void {
  const jwtStrategy: IJWTStrategy = new JWTStrategy()
  const handler = new SuperadminHandler(jwtStrategy)
  const route = new SuperadminRoute(app, handler)
  route.setupRoutes()
}

export default bootstrapSuperadmin
