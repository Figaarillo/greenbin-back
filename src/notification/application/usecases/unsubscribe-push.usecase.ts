import type PushSubscriptionRepository from '../../domain/repositories/push-subscription.repository'

class UnsubscribePushUseCase {
  constructor(private readonly repository: PushSubscriptionRepository) {}

  async exec(endpoint: string): Promise<void> {
    await this.repository.deleteByEndpoint(endpoint)
  }
}

export default UnsubscribePushUseCase
