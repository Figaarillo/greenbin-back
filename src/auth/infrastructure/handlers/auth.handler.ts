import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../application/service/auth.service'
import RecaptchaService from '../../application/service/recaptcha.service'
import LoginThrottleService from '../../application/service/login-throttle.service'
import UnifiedLoginUseCase, { type UnifiedLoginPayload } from '../../application/usecases/unified-login.usecase'
import type IJWTStrategy from '../../domain/strategies/jwt.interface.strategy'
import type ThrottleStore from '../../domain/repositories/throttle-store.repository'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'
import type ResponsibleRepository from '../../../responsible/domain/repositories/responsible.repository'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'

class AuthHandler {
  private readonly throttleService: LoginThrottleService

  constructor(
    private readonly neighborRepository: NeighborRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository,
    private readonly responsibleRepository: ResponsibleRepository,
    private readonly entityRepository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy,
    throttleStore: ThrottleStore
  ) {
    this.throttleService = new LoginThrottleService(throttleStore)
  }

  async login(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { recaptchaToken, ...payload } = req.body as UnifiedLoginPayload & { recaptchaToken?: string }

    const recaptchaService = new RecaptchaService()
    const isHuman = await recaptchaService.verify(recaptchaToken ?? '')
    if (!isHuman) {
      HandleHTTPResponse.BadRequest(rep, 'reCAPTCHA verification failed')
      return
    }

    // Composite email+IP key: unifies the rate-limit/lockout policy that used to be
    // fragmented across the 5 legacy per-role login endpoints (see design.md > Rate-limit
    // / lockout). check() increments BEFORE the login attempt, so an already-locked-out
    // client never reaches UnifiedLoginUseCase.
    const throttleKey = `${payload.email ?? payload.username ?? ''}:${req.ip}`
    await this.throttleService.check(throttleKey)

    const login = new UnifiedLoginUseCase(
      this.neighborRepository,
      this.rewardPartnerRepository,
      this.responsibleRepository,
      this.entityRepository
    )
    const user = await login.exec(payload)

    await this.throttleService.recordSuccess(throttleKey)

    const authService = new AuthService(this.jwtStrategy)
    const credential = { username: user.username, email: user.email, role: user.role }
    const accessToken = await authService.generateAccessToken(user.id, credential)
    const refreshToken = await authService.generateRefreshToken(user.id, credential)

    HandleHTTPResponse.OK(rep, 'Logged in successfully', {
      id: user.id,
      accessToken,
      refreshToken,
      role: user.role
    })
  }
}

export default AuthHandler
