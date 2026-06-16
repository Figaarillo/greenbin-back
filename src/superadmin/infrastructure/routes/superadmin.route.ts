import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type SuperadminHandler from '../handlers/superadmin.handler'

class SuperadminRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: SuperadminHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/superadmin/auth/login', async (req: FastifyRequest, rep) => {
      await this.handler.login(req, rep)
    })

    this.server.get('/api/superadmin/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req: FastifyRequest, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
  }
}

export default SuperadminRoute
