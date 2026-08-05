import type CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import type Redeemability from '../types/redeemability.type'

/**
 * Decide si un vecino puede canjear un cupón. ÚNICO lugar del sistema que sabe
 * la regla: el canje la aplica y el catálogo la muestra, los dos a través de acá.
 *
 * Para agregar una regla nueva (por ejemplo, que cada local configure cuántas
 * veces se canjea un cupón) se escribe una subclase y se enseña al resolver a
 * elegirla. Ni el usecase de canje ni el catálogo ni el front cambian.
 */
abstract class RedemptionLimitPolicy {
  /**
   * Primitiva en batch, y es deliberado: el catálogo evalúa decenas de cupones
   * de una sola vez. Una policy que resolviera de a un cupón convertiría esa
   * pantalla en un N+1 contra la base.
   *
   * Devuelve solo los cupones que NO se pueden canjear; lo ausente es canjeable.
   */
  abstract describeMany(coupons: CouponEntity[], neighborId: string): Promise<Map<string, Redeemability>>

  /** El error de dominio que corresponde cuando esta policy bloquea un canje. */
  protected abstract blockedError(): Error

  async describe(coupon: CouponEntity, neighborId: string): Promise<Redeemability> {
    const byCoupon = await this.describeMany([coupon], neighborId)
    return byCoupon.get(coupon.id) ?? { redeemable: true }
  }

  async ensureCanRedeem(coupon: CouponEntity, neighborId: string): Promise<void> {
    const { redeemable } = await this.describe(coupon, neighborId)
    if (!redeemable) {
      throw this.blockedError()
    }
  }
}

export default RedemptionLimitPolicy
