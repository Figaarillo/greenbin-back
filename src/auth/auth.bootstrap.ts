import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type IJWTStrategy from './domain/strategies/jwt.interface.strategy'
import JWTStrategy from './infrastructure/strategies/basic-jwt.strategy'
import validateAccessToken from './infrastructure/middlewares/validate-access-token.middleware'
import validateRefreshToken from './infrastructure/middlewares/validate-refresh-token.middleware'
import getTokenRole from './infrastructure/middlewares/get-token-role.middleware'
import { getHeader } from '../shared/utils/http.request.util'
import AuthService from './application/service/auth.service'
import HandleHTTPResponse from '../shared/utils/http.reply.util'
import { type Roles } from './domain/entities/role'

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
  app.decorate('authorizate', async (req: FastifyRequest, rep: FastifyReply) => {
    const allowedRoles = req.routeOptions.config.allowedRoles
    const authService = new AuthService(jwtStrategy)
    const headerToken = getHeader(req, 'authorization').split(' ')[1]

    const token = await authService.verifyRefreshToken(headerToken)

    if (allowedRoles === undefined) {
      HandleHTTPResponse.BadRequest(rep, 'No agregaste los roles permitidos')
      return
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!allowedRoles.includes(token.role)) {
      HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Invalid role')
      return
    }

    req[token.role as Roles] = token
  })
}

export default bootstrapAuth
