import type RewardPartnerRepository from '../../domain/repositories/reward-partner.repository'

class DeleteRewardPartnerUseCase {
  constructor(private readonly repository: RewardPartnerRepository) {}

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteRewardPartnerUseCase
