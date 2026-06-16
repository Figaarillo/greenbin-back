import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'

const requireOwnership = (paramKey = 'id') => {
  return async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
    if (req.user == null) {
      HandleHTTPResponse.Unauthorized(rep, 'Authentication required')
      return
    }

    const resourceId = (req.params as Record<string, string>)[paramKey]
    if (req.user.sub !== resourceId) {
      HandleHTTPResponse.Forbidden(rep, 'Cannot access resources of other users')
      // eslint-disable-next-line no-useless-return
      return
    }
  }
}

export default requireOwnership
