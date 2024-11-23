import type CouponRepository from '../../domain/repositories/coupon.repository'

class DeleteCouponUseCase {
  constructor(private readonly repository: CouponRepository) {}

  async exec(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}

export default DeleteCouponUseCase
