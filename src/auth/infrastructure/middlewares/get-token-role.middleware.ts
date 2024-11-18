import { type FastifyRequest, type FastifyReply } from 'fastify'
import { GetHeader } from '../../../shared/utils/http.request.util'
import AuthService from '../../application/service/auth.service'
import type IJWTStrategy from '../../domain/strategies/jwt.interface.strategy'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'

const getTokenRole = async (req: FastifyRequest, rep: FastifyReply, jwtStrategy: IJWTStrategy): Promise<void> => {
  const authService = new AuthService(jwtStrategy)
  const headerToken = GetHeader(req, 'authorization').split(' ')[1]

  if (headerToken === '') {
    HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Token is empty')
    return
  }

  try {
    const token = await authService.verifyAccessToken(headerToken)

    if (token.type !== 'access') {
      HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Invalid type')
      return
    }

    req.tokenRole = token.role
  } catch (error) {
    if (typeof error === 'object' && error != null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      HandleHTTPResponse.Unauthorized(rep, `Invalid token. Error: ${error.toString()}`)
    }
    HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Cannot verify token')
  }
}

export default getTokenRole
