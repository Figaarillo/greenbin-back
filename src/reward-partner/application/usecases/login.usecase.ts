import ErrorInvalidCredentialsProvided from '../../../shared/domain/errors/invalid-credentials.error'
import ErrorMissingFields from '../../../shared/domain/errors/missing-filds.error'
import type RewardPartnerEntity from '../../domain/entities/reward-partner.entity'
import ErrorRewardPartnerNotFound from '../../domain/errors/reward-partner-not-found.error'
import type RewardPartnerLoginPayload from '../../domain/payloads/reward-partner.login.payload'
import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class LoginRewardPartnerUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {}

  async exec(payload: RewardPartnerLoginPayload): Promise<RewardPartnerEntity> {
    const rewardPartner = await this.findRewardPartner(payload)

    const passwordValid = await rewardPartner.verifyPassword(payload.password)
    if (!passwordValid) {
      throw new ErrorInvalidCredentialsProvided()
    }

    if (!rewardPartner.isActive) {
      throw new ErrorInvalidCredentialsProvided(
        'Tu cuenta fue deshabilitada. Contactá a la entidad para más información.'
      )
    }

    return rewardPartner
  }

  private async findRewardPartner(payload: RewardPartnerLoginPayload): Promise<RewardPartnerEntity> {
    let rewardPartnerByEmail: RewardPartnerEntity | null = null
    let rewardPartnerByUsername: RewardPartnerEntity | null = null

    if (payload.email != null) {
      rewardPartnerByEmail = await this.repository.findWithPassword({ email: payload.email })
    }

    if (payload.username != null) {
      rewardPartnerByUsername = await this.repository.findWithPassword({ username: payload.username })
    }

    if (payload.email != null && rewardPartnerByEmail == null) {
      throw new ErrorRewardPartnerNotFound(undefined, undefined, payload.email)
    }

    if (payload.username != null && rewardPartnerByUsername == null) {
      throw new ErrorRewardPartnerNotFound(undefined, payload.username, undefined)
    }

    if (
      rewardPartnerByEmail != null &&
      rewardPartnerByUsername != null &&
      rewardPartnerByEmail.id !== rewardPartnerByUsername.id
    ) {
      throw new ErrorMissingFields(['email', 'username'])
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-non-null-assertion
    return rewardPartnerByEmail ?? rewardPartnerByUsername!
  }
}

export default LoginRewardPartnerUseCase
