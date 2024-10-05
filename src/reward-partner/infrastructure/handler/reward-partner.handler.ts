/* eslint-disable no-console */
import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/aplicaction/service/auth.service'
import type IJWTProvider from '../../../auth/domain/providers/jwt.interface.provider'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLParams } from '../../../shared/utils/http.request.util'
import RegisterRewardPartnerUseCase from '../../aplication/usecases/register.usecase'
import UpdateRewardPartnerUseCase from '../../aplication/usecases/update.usecase'
import type RewardPartnerPayload from '../../domain/payloads/reward-partner.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterRewardPartnerDTO from '../dtos/register-reward-partner.dto'
import UpdateRewardPartnerDTO from '../dtos/update-reward-partner.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'
import type RewardPartnerLoginPayload from '../../domain/payloads/reward-partner.login.payload'
import LoginRewardPartnerUseCase from '../../aplication/usecases/login.usecase'
import LoginRewardPartnerDTO from '../dtos/login-reward-partner.dto'

class RewardPartnerHandler {
  constructor(
    private readonly repository: RewardPartnerRepository,
    private readonly jwtProvider: IJWTProvider
  ) {
    this.repository = repository
  }

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: RewardPartnerPayload = req.body as RewardPartnerPayload

      const validateRegisterRewardPartnerSchema = new SchemaValidator(RegisterRewardPartnerDTO, payload)
      validateRegisterRewardPartnerSchema.exec()

      const registerRewardPartner = new RegisterRewardPartnerUseCase(this.repository)
      const rewardPartner = await registerRewardPartner.exec(payload)

      const authService = new AuthService(this.jwtProvider)
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

      const updateRewardPartner = new UpdateRewardPartnerUseCase(this.repository)
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

      const usecase = new LoginRewardPartnerUseCase(this.repository)
      const rewardPartner = await usecase.exec(payload)

      const authService = new AuthService(this.jwtProvider)
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
}

export default RewardPartnerHandler
