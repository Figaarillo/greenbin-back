/* eslint-disable indent */
import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getHeader } from '../../../shared/utils/http.request.util'
import type IJWTStrategy from '../../domain/strategies/jwt.interface.strategy'
import AuthService from '../../application/service/auth.service'

const validateAccessToken = async (
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
    const token = await authService.verifyAccessToken(headerToken)

    if (token.type !== 'access') {
      HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Invalid type')
      return
    }

    switch (token.role) {
      case 'neighbor':
        req.neighbor = token
        break
      case 'entity':
        req.entity = token
        break
      case 'responsible':
        req.responsible = token
        break
      case 'rewardPartner':
        req.rewardPartner = token
        break
      default:
        HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Invalid role')
    }
  } catch (error) {
    if (typeof error === 'object' && error != null) {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      HandleHTTPResponse.Unauthorized(rep, `Invalid token. Error: ${error.toString()}`)
    }
    HandleHTTPResponse.Unauthorized(rep, 'Invalid token. Cannot verify token')
  }
}

export default validateAccessToken
