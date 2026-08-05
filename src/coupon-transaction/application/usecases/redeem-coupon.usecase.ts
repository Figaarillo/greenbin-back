import type FindCouponByIDUseCase from '../../../coupon/application/usecases/find-by-id.usecase'
import type FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import type SubtractNeighborPointsUseCase from '../../../neighbor/application/usecases/substrac-points.usecase'
import type FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'
import type CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import ErrorCouponNotFound from '../../../coupon/domain/errors/coupon-not-found.error'
import CouponTransactionEntity from '../../domain/entities/coupon-transaction.entity'
import ErrorCouponNoLongerAvailable from '../../domain/errors/coupon-no-longer-available.error'
import ErrorNotEnoughPoints from '../../domain/errors/not-enough-points.error'
import type RedemptionPolicyResolver from '../../domain/policies/redemption-policy.resolver'
import type RedeemCouponPayload from '../../domain/payloads/redeem-coupon.payload'
import type CouponTransactionRepository from '../../domain/repositories/coupon-transaction.repository'

class RedeemCouponUseCase {
  constructor(
    private readonly repository: CouponTransactionRepository,
    private readonly findCouponById: FindCouponByIDUseCase,
    private readonly findNeighborById: FindNeighborByIDUseCase,
    private readonly findRewardPartnerById: FindRewardPartnerByIdUseCase,
    private readonly subtractPoints: SubtractNeighborPointsUseCase,
    private readonly notificationDispatcher: NotificationDispatcher,
    private readonly policyResolver: RedemptionPolicyResolver
  ) {}

  async exec(payload: RedeemCouponPayload): Promise<CouponTransactionEntity> {
    const neighbor = await this.findNeighborById.exec(payload.neighborId)
    const coupon = await this.findRedeemableCoupon(payload.couponId)
    const rewardPartner = await this.findRewardPartnerById.exec(coupon.rewardPartner as unknown as string)

    // La regla de cuántas veces se puede canjear vive en la policy, no acá: es
    // la misma que consulta el catálogo para pintar el cupón en gris.
    await this.policyResolver.resolve(coupon).ensureCanRedeem(coupon, payload.neighborId)

    if (coupon.costInPoints > neighbor.points) {
      throw new ErrorNotEnoughPoints()
    }

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

    await this.subtractPoints.exec(payload.neighborId, coupon.costInPoints)

    // Sin await a proposito: el dispatcher es self-contained (nunca deja una
    // promesa rechazada sin capturar), asi que no bloquea la respuesta HTTP
    // con la latencia del mail.
    void this.notificationDispatcher.dispatch({
      recipientId: neighbor.id,
      recipientRole: Roles.NEIGHBOR,
      category: NotificationCategory.COUPON_PURCHASED,
      title: 'Cupón comprado',
      body: `Compraste "${coupon.title}". Código: ${code}. Vence el ${expirationDate.toLocaleDateString('es-AR')}.`,
      data: { transactionId: transaction.id, couponId: coupon.id },
      sendEmail: async emailService => {
        await emailService.sendCouponPurchaseConfirmation(
          neighbor.email,
          `${neighbor.firstname} ${neighbor.lastname}`,
          coupon.title,
          code,
          expirationDate
        )
      }
    })

    // Al local: que vea en vivo que le compraron el cupón, sin refrescar.
    // Solo in-app/push por ahora (mismo patrón que register-waste-delivery
    // usa para el responsable): no se pidió un mail para este aviso.
    void this.notificationDispatcher.dispatch({
      recipientId: rewardPartner.id,
      recipientRole: Roles.REWARD_PARTNER,
      category: NotificationCategory.COUPON_PURCHASED,
      title: 'Cupón comprado',
      body: `${neighbor.firstname} ${neighbor.lastname} compró "${coupon.title}".`,
      data: { transactionId: transaction.id, couponId: coupon.id }
    })

    return transaction
  }

  // El catálogo del vecino puede estar desactualizado: entre que se pintó la
  // pantalla y el canje, el local pudo borrar el cupón (soft delete, y entonces
  // el find ni lo ve) o marcarlo como no disponible. Los dos casos son la misma
  // historia para el vecino, y ninguno es un error de servidor.
  private async findRedeemableCoupon(couponId: string): Promise<CouponEntity> {
    let coupon: CouponEntity
    try {
      coupon = await this.findCouponById.exec(couponId)
    } catch (error) {
      if (error instanceof ErrorCouponNotFound) throw new ErrorCouponNoLongerAvailable()
      throw error
    }

    if (!coupon.isAvailable) {
      throw new ErrorCouponNoLongerAvailable()
    }

    return coupon
  }
}

export default RedeemCouponUseCase
