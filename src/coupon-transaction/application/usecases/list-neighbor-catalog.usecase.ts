import type ListAvailableCouponUseCase from '../../../coupon/application/usecases/list-available-coupon.usecase'
import type RedemptionPolicyResolver from '../../domain/policies/redemption-policy.resolver'
import type Redeemability from '../../domain/types/redeemability.type'

/**
 * Se arma un objeto plano en vez de devolver la entidad con `redeemable`
 * colgado encima: MikroORM serializa únicamente las propiedades mapeadas, así
 * que un campo agregado a mano nunca llegaría al front.
 */
interface CatalogEntry extends Redeemability {
  id: string
  title: string
  description: string
  discount: number
  isAvailable: boolean
  validDays: number
  costInPoints: number
  rewardPartner: string
  createdAt: Date
}

/**
 * El catálogo del vecino: los cupones disponibles YA resueltos contra la regla
 * de canje.
 *
 * Antes el front pedía dos cosas (cupones + sus transacciones) y deducía él
 * mismo cuáles ya había canjeado, o sea que reimplementaba la regla en el
 * cliente. Acá la resuelve la policy, una sola vez y del lado que manda.
 */
class ListNeighborCatalogUseCase {
  constructor(
    private readonly listAvailableCoupons: ListAvailableCouponUseCase,
    private readonly policyResolver: RedemptionPolicyResolver
  ) {}

  async exec(neighborId: string, offset: number, limit: number, entityId?: string): Promise<CatalogEntry[]> {
    // offset/limit llegan como NaN cuando no vienen en la query: es el contrato
    // que ya usa ListAvailableCouponUseCase y significa "traé todo".
    const coupons = await this.listAvailableCoupons.exec(offset, limit, entityId)

    const blocked = new Map<string, Redeemability>()
    for (const [policy, group] of this.policyResolver.groupByPolicy(coupons)) {
      const described = await policy.describeMany(group, neighborId)
      for (const [couponId, state] of described) {
        blocked.set(couponId, state)
      }
    }

    return coupons.map(coupon => ({
      id: coupon.id,
      title: coupon.title,
      description: coupon.description,
      discount: coupon.discount,
      isAvailable: coupon.isAvailable,
      validDays: coupon.validDays,
      costInPoints: coupon.costInPoints,
      // Relación sin popular: MikroORM deja una referencia con solo el id, que es
      // exactamente lo que el front necesita para pedir los datos del local.
      rewardPartner: (coupon.rewardPartner as unknown as { id: string }).id,
      createdAt: coupon.createdAt,
      ...(blocked.get(coupon.id) ?? { redeemable: true })
    }))
  }
}

export default ListNeighborCatalogUseCase
export type { CatalogEntry }
