import { type FastifyInstance } from 'fastify'
import type PasswordResetHandler from '../handlers/password-reset.handler'

class PasswordResetRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: PasswordResetHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/auth/forgot-password', async (req, rep) => {
      await this.handler.forgotPassword(req, rep)
    })

    this.server.post('/api/auth/reset-password', async (req, rep) => {
      await this.handler.resetPassword(req, rep)
    })
  }
}

export default PasswordResetRoute
