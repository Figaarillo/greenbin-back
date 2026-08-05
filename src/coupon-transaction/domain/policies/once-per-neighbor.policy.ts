import type CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import ErrorCouponAlreadyHeld from '../errors/coupon-already-held.error'
import type CouponTransactionRepository from '../repositories/coupon-transaction.repository'
import type Redeemability from '../types/redeemability.type'
import RedemptionLimitPolicy from './redemption-limit.policy'

const YA_CANJEADO = 'Ya canjeado'

/**
 * Regla vigente: el vecino puede tener UN canje sin usar de cada cupón.
 *
 * Una vez que lo presenta en el local (USADO) o se le vence (EXPIRADO), el cupón
 * vuelve a estar disponible para él. El cupón no es una unidad de stock: que lo
 * canjee un vecino no lo agota para el resto.
 */
class OncePerNeighborPolicy extends RedemptionLimitPolicy {
  constructor(private readonly repository: CouponTransactionRepository) {
    super()
  }

  async describeMany(coupons: CouponEntity[], neighborId: string): Promise<Map<string, Redeemability>> {
    const heldIds = await this.repository.findHeldCouponIds(
      neighborId,
      coupons.map(coupon => coupon.id)
    )

    return new Map(heldIds.map(couponId => [couponId, { redeemable: false, reason: YA_CANJEADO }]))
  }

  protected blockedError(): Error {
    return new ErrorCouponAlreadyHeld()
  }
}

export default OncePerNeighborPolicy
