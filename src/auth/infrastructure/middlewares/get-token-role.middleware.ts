import { type FastifyRequest, type FastifyReply } from 'fastify'
import { GetHeader } from '../../../shared/utils/http.request.util'
import AuthService from '../../aplicaction/service/auth.service'
import type IJWTProvider from '../../domain/providers/jwt.interface.provider'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'

const getTokenRole = async (req: FastifyRequest, rep: FastifyReply, jwtProvider: IJWTProvider): Promise<void> => {
  const authService = new AuthService(jwtProvider)
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
