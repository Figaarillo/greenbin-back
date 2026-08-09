import { type FastifyInstance } from 'fastify'
import type AuthHandler from '../handlers/auth.handler'

class AuthRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: AuthHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/auth/login', async (req, rep) => {
      await this.handler.login(req, rep)
    })
  }
}

export default AuthRoute
