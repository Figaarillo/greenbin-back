import type CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import type CouponTransactionRepository from '../repositories/coupon-transaction.repository'
import OncePerNeighborPolicy from './once-per-neighbor.policy'
import type RedemptionLimitPolicy from './redemption-limit.policy'

/**
 * Elige qué policy de canje rige para un cupón.
 *
 * Hoy devuelve siempre la misma, y está bien: el valor está en que TODOS los
 * consumidores (canje y catálogo) ya preguntan acá. El día que un local pueda
 * configurar cuántas veces se canjea su cupón, este método lee esa config y
 * devuelve otra policy — y no hay que tocar ningún usecase, handler ni pantalla.
 */
class RedemptionPolicyResolver {
  private readonly oncePerNeighbor: OncePerNeighborPolicy

  constructor(repository: CouponTransactionRepository) {
    this.oncePerNeighbor = new OncePerNeighborPolicy(repository)
  }

  resolve(_coupon: CouponEntity): RedemptionLimitPolicy {
    return this.oncePerNeighbor
  }

  /**
   * Los cupones de una misma pantalla pueden regirse por policies distintas, así
   * que se agrupan y cada grupo se resuelve con una sola consulta. Hoy el grupo
   * siempre es uno solo; la agrupación existe para que el día que deje de serlo
   * el catálogo no se convierta en un N+1.
   */
  groupByPolicy(coupons: CouponEntity[]): Map<RedemptionLimitPolicy, CouponEntity[]> {
    const groups = new Map<RedemptionLimitPolicy, CouponEntity[]>()

    for (const coupon of coupons) {
      const policy = this.resolve(coupon)
      const group = groups.get(policy) ?? []
      group.push(coupon)
      groups.set(policy, group)
    }

    return groups
  }
}

export default RedemptionPolicyResolver
