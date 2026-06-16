import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type IJWTStrategy from './domain/strategies/jwt.interface.strategy'
import JWTStrategy from './infrastructure/strategies/basic-jwt.strategy'
import validateAccessToken from './infrastructure/middlewares/validate-access-token.middleware'
import validateRefreshToken from './infrastructure/middlewares/validate-refresh-token.middleware'
import requireRoles from './infrastructure/middlewares/require-roles.middleware'
import requireOwnership from './infrastructure/middlewares/require-ownership.middleware'
import { type Roles } from './domain/entities/role'

function bootstrapAuth(app: FastifyInstance): void {
  const jwtStrategy: IJWTStrategy = new JWTStrategy()

  app.decorate('validateAccessToken', async (req: FastifyRequest, rep: FastifyReply) => {
    await validateAccessToken(req, rep, jwtStrategy)
  })

  app.decorate('validateRefreshToken', async (req: FastifyRequest, rep: FastifyReply) => {
    await validateRefreshToken(req, rep, jwtStrategy)
  })

  app.decorate('protect', (...roles: Roles[]) => {
    return async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
      await validateAccessToken(req, rep, jwtStrategy)
      if (rep.sent) return
      await requireRoles(...roles)(req, rep)
    }
  })

  app.decorate('protectOwner', (paramKey: string, ...roles: Roles[]) => {
    return async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
      await validateAccessToken(req, rep, jwtStrategy)
      if (rep.sent) return
      await requireRoles(...roles)(req, rep)
      if (rep.sent) return
      await requireOwnership(paramKey)(req, rep)
    }
  })
}

export default bootstrapAuth
