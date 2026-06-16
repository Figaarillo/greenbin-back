import { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import JWTStrategy from '../auth/infrastructure/strategies/basic-jwt.strategy'
import AuthService from '../auth/application/service/auth.service'
import RecaptchaService from '../auth/application/service/recaptcha.service'
import { Roles } from '../auth/domain/entities/role'
import validateAccessToken from '../auth/infrastructure/middlewares/validate-access-token.middleware'
import HandleHTTPResponse from '../shared/utils/http.reply.util'
import ResponsibleMikroORMRepository from '../responsible/infrastructure/repositories/mikro-orm/responsible.mikroorm.repository'
import LoginResponsibleUseCase from '../responsible/application/usecases/login.usecase'
import ErrorInvalidCredentialsProvided from '../shared/domain/errors/invalid-credentials.error'

async function bootstrapSuperadmin(app: FastifyInstance): Promise<void> {
  const jwtStrategy = new JWTStrategy()

  app.post('/api/superadmin/auth/login', async (req: FastifyRequest, rep: FastifyReply) => {
    const { username, password, recaptchaToken } = req.body as {
      username?: string
      email?: string
      password: string
      recaptchaToken?: string
    }

    const recaptchaService = new RecaptchaService()
    const isHuman = await recaptchaService.verify(recaptchaToken ?? '')
    if (!isHuman) {
      HandleHTTPResponse.BadRequest(rep, 'reCAPTCHA verification failed')
      return
    }

    const repository = new ResponsibleMikroORMRepository()
    const login = new LoginResponsibleUseCase(repository)
    const admin = await login.exec({ username, password })

    if (admin.role !== Roles.ADMIN) {
      throw new ErrorInvalidCredentialsProvided()
    }

    const authService = new AuthService(jwtStrategy)
    const accessToken = await authService.generateAccessToken(admin.id, {
      username: admin.username,
      email: admin.email,
      role: admin.role
    })
    const refreshToken = await authService.generateRefreshToken(admin.id, {
      username: admin.username,
      email: admin.email,
      role: admin.role
    })

    HandleHTTPResponse.OK(rep, 'Superadmin logged successfully', {
      id: admin.id,
      accessToken,
      refreshToken
    })
  })

  app.get('/api/superadmin/auth/validate-role', {
    preHandler: app.auth([
      async (req: FastifyRequest, rep: FastifyReply) => {
        await validateAccessToken(req, rep, jwtStrategy)
      }
    ]),
    handler: async (req: FastifyRequest, rep: FastifyReply) => {
      if (req.user.role !== Roles.ADMIN) {
        throw new Error('Invalid role')
      }
      HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
    }
  })
}

export default bootstrapSuperadmin
