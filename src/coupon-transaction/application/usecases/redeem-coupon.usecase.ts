import type FindCouponByIDUseCase from '../../../coupon/application/usecases/find-by-id.usecase'
import type UpdateCouponStateUseCase from '../../../coupon/application/usecases/update-state.usecase'
import type FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import type SubtractNeighborPointsUseCase from '../../../neighbor/application/usecases/substrac-points.usecase'
import type FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'
import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'

class RedeemCouponUseCase {
  constructor(
    private readonly repository: CouponTransactionRepository,
    private readonly findCouponById: FindCouponByIDUseCase,
    private readonly findNeighborById: FindNeighborByIDUseCase,
    private readonly findRewardPartnerById: FindRewardPartnerByIdUseCase,
    private readonly subtractPoints: SubtractNeighborPointsUseCase,
    private readonly updateState: UpdateCouponStateUseCase
  ) {}

  async exec(payload: RedeemCouponPayload): Promise<CouponTransactionEntity> {
    const neighbor = await this.findNeighborById.exec(payload.neighborId)
    const coupon = await this.findCouponById.exec(payload.couponId)
    const rewardPartner = await this.findRewardPartnerById.exec(coupon.rewardPartner as unknown as string)

    if (coupon.costInPoints > neighbor.points) {
      throw new Error('You do not have enough points to redeem this coupon')
    }

    if (!coupon.isAvailable) {
      throw new Error('Coupon is not available')
    }

    if (coupon.state === 'ADQUIRIDO') {
      throw new Error('Coupon already redeemed')
    }

    await this.subtractPoints.exec(payload.neighborId, coupon.costInPoints)
    await this.updateState.exec(coupon.id, 'ADQUIRIDO')
    const redeemedDate = new Date()
    const code = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
    const expirationDate = new Date(redeemedDate.getTime() + coupon.validDays * 24 * 60 * 60 * 1000)

    const newTransaction = new CouponTransactionEntity(
      code,
      'ADQUIRIDO',
      undefined,
      redeemedDate,
      expirationDate,
      coupon.costInPoints,
      coupon,
      neighbor,
      rewardPartner
    )

    const transaction = await this.repository.save(newTransaction)
    if (transaction == null) {
      throw new Error('Cannot redeem new coupon transaction')
    }

    return transaction
  }
}

export default RedeemCouponUseCase
