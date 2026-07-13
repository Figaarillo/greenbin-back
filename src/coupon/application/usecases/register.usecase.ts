import type FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'
import CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCannotSaveCoupon from '../../domain/errors/cannot-save-coupon.error'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'

class RegisterCouponUseCase {
  constructor(
    private readonly repository: CouponRepository,
    private readonly findRewardPartner: FindRewardPartnerByIdUseCase,
    private readonly notificationDispatcher: NotificationDispatcher
  ) {}

  async exec(payload: CouponPayload): Promise<CouponEntity> {
    const rewardPartner = await this.findRewardPartner.exec(payload.rewardPartnerId)
    const newCoupon = new CouponEntity(payload, rewardPartner)

    const coupon = await this.repository.save(newCoupon)
    if (coupon == null) {
      throw new ErrorCannotSaveCoupon()
    }

    // Unico destinatario: el local que lo creo. Nada masivo a vecinos de la
    // entidad (decision de alcance ya tomada).
    void this.notificationDispatcher.dispatch({
      recipientId: rewardPartner.id,
      recipientRole: Roles.REWARD_PARTNER,
      category: NotificationCategory.COUPON_CREATED,
      title: 'Cupón creado',
      body: `Tu cupón "${coupon.title}" fue creado y ya está disponible.`,
      sendEmail: async emailService => {
        await emailService.sendCouponCreatedConfirmation(rewardPartner.email, rewardPartner.name, coupon.title)
      }
    })

    return coupon
  }
}

export default RegisterCouponUseCase
