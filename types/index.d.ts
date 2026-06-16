import { type AuthUser } from '../src/auth/domain/entities/auth-user'
import { type Roles } from '../src/auth/domain/entities/role'
import { type FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    auth: fastifyAuth
    validateAccessToken: (req: FastifyRequest, rep: FastifyReply) => Promise<void>
    validateRefreshToken: (req: FastifyRequest, rep: FastifyReply) => Promise<void>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protect: (...roles: Roles[]) => any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protectOwner: (paramKey: string, ...roles: Roles[]) => any
  }

  interface FastifyRequest {
    user: AuthUser
  }

  interface FastifyContextConfig {
    allowedRoles?: string[]
  }
}
