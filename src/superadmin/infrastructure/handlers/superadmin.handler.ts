import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'

class SuperadminHandler {
  constructor(private readonly jwtStrategy: IJWTStrategy) {}

  async login(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { username, password } = req.body as { username: string; password: string }

    if (username !== SUPERADMIN_USERNAME || password !== SUPERADMIN_PASSWORD) {
      HandleHTTPResponse.Unauthorized(rep, 'Credenciales inválidas')
      return
    }

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(SUPERADMIN_ID, {
      username: SUPERADMIN_USERNAME,
      role: Roles.ADMIN
    })
    const refreshToken = await authService.generateRefreshToken(SUPERADMIN_ID, {
      username: SUPERADMIN_USERNAME,
      role: Roles.ADMIN
    })

    HandleHTTPResponse.Created(rep, 'Superadmin logged in successfully', { accessToken, refreshToken })
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenRole = req.tokenRole
    if (tokenRole !== Roles.ADMIN) {
      HandleHTTPResponse.Unauthorized(rep, 'Invalid role')
      return
    }
    HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
  }
}

export default SuperadminHandler
