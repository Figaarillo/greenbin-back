import type FindRewardPartnerByIdUseCase from '../../../reward-partner/application/usecases/find-by-id.usecase'
import type ListNeighborsUseCase from '../../../neighbor/application/usecases/list.usecase'
import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'
import CouponEntity from '../../domain/entities/coupon.entity'
import ErrorCannotSaveCoupon from '../../domain/errors/cannot-save-coupon.error'
import type CouponPayload from '../../domain/payloads/coupon.payload'
import type CouponRepository from '../../domain/repositories/coupon.repository'

// Limite pragmatico para el fan-out a vecinos: no hay entidades con mas
// vecinos que esto en el alcance actual de la app. Si se necesita mas, hay
// que paginar el fan-out en vez de subir el numero.
const MAX_NEIGHBORS_PER_ENTITY = 10000

class RegisterCouponUseCase {
  constructor(
    private readonly repository: CouponRepository,
    private readonly findRewardPartner: FindRewardPartnerByIdUseCase,
    private readonly notificationDispatcher: NotificationDispatcher,
    private readonly listNeighbors: ListNeighborsUseCase
  ) {}

  async exec(payload: CouponPayload): Promise<CouponEntity> {
    const rewardPartner = await this.findRewardPartner.exec(payload.rewardPartnerId)
    const newCoupon = new CouponEntity(payload, rewardPartner)

    const coupon = await this.repository.save(newCoupon)
    if (coupon == null) {
      throw new ErrorCannotSaveCoupon()
    }

    // Al local: confirmacion de que su cupon quedo creado.
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

    // A cada vecino de la misma entidad: que vean el cupon nuevo en el
    // catalogo en vivo (via SSE) sin refrescar. Deliberadamente SIN mail acá
    // (mandarle un mail a todos los vecinos por cada cupon creado seria
    // spam); el in-app/push que dispare el dispatcher para cada uno queda
    // gateado por su propia preferencia de COUPON_CREATED, igual que siempre.
    const neighbors = await this.listNeighbors.exec(0, MAX_NEIGHBORS_PER_ENTITY, rewardPartner.entity.id)
    for (const neighbor of neighbors) {
      void this.notificationDispatcher.dispatch({
        recipientId: neighbor.id,
        recipientRole: Roles.NEIGHBOR,
        category: NotificationCategory.COUPON_CREATED,
        title: 'Nuevo cupón disponible',
        body: `"${coupon.title}" ya está disponible en ${rewardPartner.name}.`,
        data: { couponId: coupon.id }
      })
    }

    return coupon
  }
}

export default RegisterCouponUseCase
