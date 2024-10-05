import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorInvalidPassword from '../../domain/errors/invalid-password.error'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerLoginPayload from '../../domain/payloads/reward-partner.login.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class LoginRewardPartnerUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {
    this.repository = repository
  }

  async exec(payload: RewardPartnerLoginPayload): Promise<RewardPartnerEntity> {
    const rewardPartner = await this.findRewardPartner(payload)
    if (rewardPartner == null) {
      throw new ErrorRewardPartnerNotFound(undefined, payload.email, payload.username)
    }

    const passwordValid = await rewardPartner.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidPassword()
    }

    return rewardPartner
  }

  private async findRewardPartner(payload: RewardPartnerLoginPayload): Promise<RewardPartnerEntity | null> {
    if (payload.email !== undefined && payload.email !== '') {
      return await this.repository.findWithPassword({ email: payload.email })
    }

    if (payload.username !== undefined && payload.username !== '') {
      return await this.repository.findWithPassword({ username: payload.username })
    }

    throw new Error('Email or username is required')
  }
}

export default LoginRewardPartnerUseCase
