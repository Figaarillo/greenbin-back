import { type FastifyInstance } from 'fastify'
import type RegisterVerificationHandler from '../handlers/register-verification.handler'

class RegisterVerificationRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: RegisterVerificationHandler
  ) {}

  setupRoutes(): void {
    this.server.post('/api/auth/register/request-otp', async (req, rep) => {
      await this.handler.requestOtp(req, rep)
    })
  }
}

export default RegisterVerificationRoute
