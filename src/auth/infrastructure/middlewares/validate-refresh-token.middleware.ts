import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getHeader } from '../../../shared/utils/http.request.util'
import AuthService from '../../application/service/auth.service'
import type IJWTStrategy from '../../domain/strategies/jwt.interface.strategy'
import { type AuthUser } from '../../domain/entities/auth-user'

const validateRefreshToken = async (
  req: FastifyRequest,
  rep: FastifyReply,
  jwtStrategy: IJWTStrategy
): Promise<void> => {
  const authService = new AuthService(jwtStrategy)
  const headerToken = getHeader(req, 'authorization').split(' ')[1]

  if (headerToken === '') {
    HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Token is empty')
    return
  }

  try {
    const token = await authService.verifyRefreshToken(headerToken)

    if (token.type !== 'refresh') {
      HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Invalid type')
      return
    }

    req.user = token as unknown as AuthUser
  } catch (error) {
    if (typeof error === 'object' && error != null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      HandleHTTPResponse.Unauthorized(rep, `Invalid token. Error: ${error.toString()}`)
    }
    HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Cannot verify token')
  }
}

export default validateRefreshToken
