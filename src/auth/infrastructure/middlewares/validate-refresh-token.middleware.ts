/* eslint-disable indent */
import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetHeader } from '../../../shared/utils/http.request.util'
import AuthService from '../../aplicaction/service/auth.service'
import type IJWTProvider from '../../domain/providers/jwt.interface.provider'

const validateRefreshToken = async (
  req: FastifyRequest,
  rep: FastifyReply,
  jwtProvider: IJWTProvider
): Promise<void> => {
  const authService = new AuthService(jwtProvider)
  const headerToken = GetHeader(req, 'authorization').split(' ')[1]

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

export default validateRefreshToken
