import { type FastifyReply, type FastifyRequest } from 'fastify'
import { type Roles } from '../../domain/entities/role'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'

const requireRoles = (...roles: Roles[]) => {
  return async (req: FastifyRequest, rep: FastifyReply): Promise<void> => {
    if (req.user == null) {
      HandleHTTPResponse.Unauthorized(rep, 'Authentication required')
      return
    }

    if (!roles.includes(req.user.role)) {
      HandleHTTPResponse.Forbidden(rep, 'Insufficient permissions')
      // eslint-disable-next-line no-useless-return
      return
    }
  }
}

export default requireRoles
