import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import RecaptchaService from '../../../auth/application/service/recaptcha.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getURLParams, getPaginationParams } from '../../../shared/utils/http.request.util'
import FindByEmailUseCase from '../../application/usecases/find-by-email.usecase'
import FindRewardPartnerByIDUseCase from '../../application/usecases/find-by-id.usecase'
import LoginRewardPartnerUseCase from '../../application/usecases/login.usecase'
import RegisterRewardPartnerUseCase from '../../application/usecases/register.usecase'
import UpdateRewardPartnerUseCase from '../../application/usecases/update.usecase'
import type RewardPartnerLoginPayload from '../../domain/payloads/reward-partner.login.payload'
import type RewardPartnerPayload from '../../domain/payloads/reward-partner.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import LoginRewardPartnerDTO from '../dtos/login-reward-partner.dto'
import RegisterRewardPartnerDTO from '../dtos/register-reward-partner.dto'
import UpdateRewardPartnerDTO from '../dtos/update-reward-partner.dto'
import RewardPartnerSchemaValidator from '../middlewares/zod-schema-validator.middleware'
import ListRewardPartnersUseCase from '../../application/usecases/list.usecase'
import DeleteRewardPartnerUseCase from '../../application/usecases/delete.usecase'

class RewardPartnerHandler {
  constructor(
    private readonly rewardPartnerRepository: RewardPartnerRepository,
    private readonly entityRepository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy
  ) {}

  async findById(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new RewardPartnerSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findRewardPartner = new FindRewardPartnerByIDUseCase(this.rewardPartnerRepository)
    const rewardPartner = await findRewardPartner.exec(id)

    HandleHTTPResponse.OK(rep, 'Reward partner retrieved successfully', rewardPartner)
  }

  async register(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const payload: RewardPartnerPayload = req.body as RewardPartnerPayload

    const validateRegisterRewardPartnerSchema = new RewardPartnerSchemaValidator(RegisterRewardPartnerDTO, payload)
    validateRegisterRewardPartnerSchema.exec()

    const registerRewardPartner = new RegisterRewardPartnerUseCase(
      this.rewardPartnerRepository,
      new FindEntityByIDUseCase(this.entityRepository)
    )
    const rewardPartner = await registerRewardPartner.exec(payload)

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(rewardPartner.id, {
      name: rewardPartner.name,
      role: 'reward-partner'
    })
    const refreshToken = await authService.generateRefreshToken(rewardPartner.id, { name: rewardPartner.name })

    HandleHTTPResponse.Created(rep, 'Reward partner registered successfully', {
      id: rewardPartner.id,
      accessToken,
      refreshToken
    })
  }

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')
    const payload: RewardPartnerPayload = req.body as RewardPartnerPayload

    const validateIDSchema = new RewardPartnerSchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const schemaValidator = new RewardPartnerSchemaValidator(UpdateRewardPartnerDTO, payload)
    schemaValidator.exec()

    const updateRewardPartner = new UpdateRewardPartnerUseCase(this.rewardPartnerRepository)
    await updateRewardPartner.exec(id, payload)

    HandleHTTPResponse.OK(rep, 'Reward partner updated successfully', { id })
  }

  async login(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { recaptchaToken, ...payload } = req.body as RewardPartnerLoginPayload & { recaptchaToken: string }

    const recaptchaService = new RecaptchaService()
    const isHuman = await recaptchaService.verify(recaptchaToken)
    if (!isHuman) {
      HandleHTTPResponse.BadRequest(rep, 'reCAPTCHA verification failed')
      return
    }

    const schemaValidator = new RewardPartnerSchemaValidator(LoginRewardPartnerDTO, payload)
    schemaValidator.exec()

    const login = new LoginRewardPartnerUseCase(this.rewardPartnerRepository)
    const rewardPartner = await login.exec(payload)

    if (!rewardPartner.isActive) {
      throw new Error('La cuenta está deshabilitada.')
    }

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(rewardPartner.id, {
      username: rewardPartner.username,
      email: rewardPartner.email,
      role: rewardPartner.role
    })
    const refreshToken = await authService.generateRefreshToken(rewardPartner.id, {
      username: rewardPartner.username,
      email: rewardPartner.email,
      role: rewardPartner.role
    })

    HandleHTTPResponse.OK(rep, 'Reward partner logged in successfully', {
      id: rewardPartner.id,
      accessToken,
      refreshToken
    })
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenRewardPartner = req.rewardPartner as { username: string; email: string; role: string }

    const findByEmail = new FindByEmailUseCase(this.rewardPartnerRepository)
    const rewardPartner = await findByEmail.exec(tokenRewardPartner.email)

    const authService = new AuthService(this.jwtStrategy)
    const accessToken = await authService.generateAccessToken(req.rewardPartner.id, {
      username: rewardPartner.username,
      email: rewardPartner.email,
      role: rewardPartner.role
    })

    HandleHTTPResponse.OK(rep, 'Access token refreshed successfully', {
      accessToken
    })
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenEntity = req.tokenRole
    if (tokenEntity !== Roles.REWARD_PARTNER) {
      throw new Error('Invalid role')
    }
    HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const schemaValidator = new RewardPartnerSchemaValidator(CheckIdDTO, { id })
    schemaValidator.exec()

    const deleteRewardPartner = new DeleteRewardPartnerUseCase(this.rewardPartnerRepository)
    await deleteRewardPartner.exec(id)

    HandleHTTPResponse.OK(rep, 'Reward partner deleted successfully', { id })
  }

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = getPaginationParams(req)

    const entityId = req.query.entityId
    const listRewardPartners = new ListRewardPartnersUseCase(this.rewardPartnerRepository)
    const rewardPartners = await listRewardPartners.exec(offset, limit, entityId)

    HandleHTTPResponse.OK(rep, 'Reward partners retrieved successfully', rewardPartners)
  }
}

export default RewardPartnerHandler
