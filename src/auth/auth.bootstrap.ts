import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import type IJWTProvider from './domain/providers/jwt.interface.provider'
import JWTProvider from './infrastructure/provider/jwt.provider'
import validateAccessToken from './infrastructure/middlewares/validate-access-token.middleware'
import validateRefreshToken from './infrastructure/middlewares/validate-refresh-token.middleware'
import getTokenRole from './infrastructure/middlewares/get-token-role.middleware'

function bootstrapAuth(app: FastifyInstance): void {
  const jwtProvider: IJWTProvider = new JWTProvider()

  app.decorate('validateAccessToken', async (req: FastifyRequest, rep: FastifyReply) => {
    await validateAccessToken(req, rep, jwtProvider)
  })

  app.decorate('validateRefreshToken', async (req: FastifyRequest, rep: FastifyReply) => {
    await validateRefreshToken(req, rep, jwtProvider)
  })

  app.decorate('getTokenRole', async (req: FastifyRequest, rep: FastifyReply) => {
    await getTokenRole(req, rep, jwtProvider)
  })
}

export default bootstrapAuth
