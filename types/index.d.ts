import { type FastifyReply } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    auth: fastifyAuth
    validateAccessToken: (req: FastifyRequest, rep: FastifyReply) => Promise<void>
    validateRefreshToken: (req: FastifyRequest, rep: FastifyReply) => Promise<void>
    getTokenRole: (req: FastifyRequest, rep: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    entity: Record<strign, string>
    neighbor: Record<strign, string>
    responsible: Record<strign, string>
    rewardPartner: Record<strign, string>
    admin: Record<strign, string>
    user: Record<strign, string>
    tokenRole: string
  }
}
