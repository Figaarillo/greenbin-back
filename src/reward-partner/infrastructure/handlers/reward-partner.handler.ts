/* eslint-disable no-console */
import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLParams } from '../../../shared/utils/http.request.util'
import FindByEmailUseCase from '../../application/usecases/find-by-email.usecase'
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
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class RewardPartnerHandler {
  constructor(
    private readonly rewardPartnerRepository: RewardPartnerRepository,
    private readonly entityRepository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy
  ) {}

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: RewardPartnerPayload = req.body as RewardPartnerPayload

      const validateRegisterRewardPartnerSchema = new SchemaValidator(RegisterRewardPartnerDTO, payload)
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

      HandleHTTPResponse.Created(res, 'Reward partner registered successfully', {
        id: rewardPartner.id,
        accessToken,
        refreshToken
      })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: RewardPartnerPayload = req.body as RewardPartnerPayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateRewardPartnerDTO, payload)
      schemaValidator.exec()

      const updateRewardPartner = new UpdateRewardPartnerUseCase(this.rewardPartnerRepository)
      await updateRewardPartner.exec(id, payload)

      HandleHTTPResponse.OK(res, 'Reward partner updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async login(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload = req.body as RewardPartnerLoginPayload

      const schemaValidator = new SchemaValidator(LoginRewardPartnerDTO, payload)
      schemaValidator.exec()

      const login = new LoginRewardPartnerUseCase(this.rewardPartnerRepository)
      const rewardPartner = await login.exec(payload)

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

      HandleHTTPResponse.OK(res, 'Reward partner logged in successfully', {
        id: rewardPartner.id,
        accessToken,
        refreshToken
      })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
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
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenEntity = req.tokenRole
      if (tokenEntity !== Roles.REWARD_PARTNER) {
        throw new Error('Invalid role')
      }
      HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
    } catch (error) {
      rep.status(500).send(error)
    }
  }
}

export default RewardPartnerHandler
