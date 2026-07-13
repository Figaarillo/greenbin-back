import { describe, expect, it, vi } from 'vitest'
import RegisterCouponUseCase from '../application/usecases/register.usecase'
import type CouponRepository from '../domain/repositories/coupon.repository'
import type FindRewardPartnerByIdUseCase from '../../reward-partner/application/usecases/find-by-id.usecase'
import type NotificationDispatcher from '../../notification/application/service/notification-dispatcher.service'
import { NotificationCategory } from '../../notification/domain/enums/notification-category.enum'
import { Roles } from '../../auth/domain/entities/role'
import EntityEntity from '../../entity/domain/entities/entity.entity'
import RewardPartnerEntity from '../../reward-partner/domain/entities/reward-partner.entity'
import type CouponEntity from '../domain/entities/coupon.entity'

const mockEntity = new EntityEntity({
  name: 'Entity Test',
  email: 'e@test.com',
  description: 'desc',
  password: 'pass',
  city: 'city',
  province: 'prov',
  coordinates: { latitude: -32.0, longitude: -63.0 }
})

const mockRewardPartner = new RewardPartnerEntity(
  {
    name: 'Local Test',
    username: 'localtest',
    address: 'addr',
    cuit: '20-12345678-9',
    email: 'local@test.com',
    password: 'p',
    phoneNumber: '1234567890',
    coordinates: { latitude: -32.1, longitude: -63.1 },
    entityId: mockEntity.id
  },
  mockEntity
)

function makeUseCase(dispatch: ReturnType<typeof vi.fn>): RegisterCouponUseCase {
  const repository = { save: async (coupon: CouponEntity) => coupon } as unknown as CouponRepository
  const findRewardPartner = { exec: async () => mockRewardPartner } as unknown as FindRewardPartnerByIdUseCase
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

  return new RegisterCouponUseCase(repository, findRewardPartner, notificationDispatcher)
}

describe('RegisterCouponUseCase — notificaciones', () => {
  it('dispara COUPON_CREATED únicamente al local que creó el cupón (sin masivo a vecinos)', async () => {
    const dispatch = vi.fn()
    const useCase = makeUseCase(dispatch)

    await useCase.exec({
      title: 'Cupón nuevo',
      description: 'desc',
      discount: 15,
      state: 'AVAILABLE',
      isAvailable: true,
      validDays: 20,
      costInPoints: 30,
      rewardPartnerId: mockRewardPartner.id
    })

    expect(dispatch).toHaveBeenCalledTimes(1)
    const event = dispatch.mock.calls[0][0]
    expect(event.recipientId).toBe(mockRewardPartner.id)
    expect(event.recipientRole).toBe(Roles.REWARD_PARTNER)
    expect(event.category).toBe(NotificationCategory.COUPON_CREATED)
    // Decisión de alcance confirmada: nunca se notifica al rol NEIGHBOR desde este flujo.
    expect(event.recipientRole).not.toBe(Roles.NEIGHBOR)
  })
})
