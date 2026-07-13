import type FindCouponByIDUseCase from '../../../coupon/application/usecases/find-by-id.usecase'
import type FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import type SubtractNeighborPointsUseCase from '../../../neighbor/application/usecases/substrac-points.usecase'
import type FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'
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
    private readonly notificationDispatcher: NotificationDispatcher
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

    return transaction
  }
}

export default RedeemCouponUseCase
