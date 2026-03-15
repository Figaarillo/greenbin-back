import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type IJWTStrategy from './domain/strategies/jwt.interface.strategy'
import JWTStrategy from './infrastructure/strategies/basic-jwt.strategy'
import validateAccessToken from './infrastructure/middlewares/validate-access-token.middleware'
import validateRefreshToken from './infrastructure/middlewares/validate-refresh-token.middleware'
import getTokenRole from './infrastructure/middlewares/get-token-role.middleware'

function bootstrapAuth(app: FastifyInstance): void {
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  app.decorate('validateAccessToken', async (req: FastifyRequest, rep: FastifyReply) => {
    await validateAccessToken(req, rep, jwtStrategy)
  })

  app.decorate('validateRefreshToken', async (req: FastifyRequest, rep: FastifyReply) => {
    await validateRefreshToken(req, rep, jwtStrategy)
  })

  app.decorate('getTokenRole', async (req: FastifyRequest, rep: FastifyReply) => {
    await getTokenRole(req, rep, jwtStrategy)
  })
}

export default bootstrapAuth
