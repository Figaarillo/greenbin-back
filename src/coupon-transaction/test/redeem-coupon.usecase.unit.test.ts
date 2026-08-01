import { describe, expect, it, vi } from 'vitest'
import RedeemCouponUseCase from '../application/usecases/redeem-coupon.usecase'
import type CouponTransactionRepository from '../domain/repositories/coupon-transaction.repository'
import type FindCouponByIDUseCase from '../../coupon/application/usecases/find-by-id.usecase'
import type FindNeighborByIDUseCase from '../../neighbor/application/usecases/find-by-id.usecase'
import type SubtractNeighborPointsUseCase from '../../neighbor/application/usecases/substrac-points.usecase'
import type FindRewardPartnerByIdUseCase from '../../reward-partner/application/usecases/find-by-id.usecase'
import type NotificationDispatcher from '../../notification/application/service/notification-dispatcher.service'
import { NotificationCategory } from '../../notification/domain/enums/notification-category.enum'
import { Roles } from '../../auth/domain/entities/role'
import EntityEntity from '../../entity/domain/entities/entity.entity'
import NeighborEntity from '../../neighbor/domain/entities/neighbor.entity'
import RewardPartnerEntity from '../../reward-partner/domain/entities/reward-partner.entity'
import CouponEntity from '../../coupon/domain/entities/coupon.entity'
import type CouponTransactionEntity from '../domain/entities/coupon-transaction.entity'

const mockEntity = new EntityEntity({
  name: 'Entity Test',
  email: 'e@test.com',
  description: 'desc',
  password: 'pass',
  city: 'city',
  province: 'prov',
  coordinates: { latitude: -32.0, longitude: -63.0 }
})

const mockNeighbor = new NeighborEntity(
  'N',
  'N',
  'nn',
  'n@n.com',
  'p',
  22222222,
  '1234567890',
  new Date('1990-01-01'),
  mockEntity
)

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

const mockCoupon = new CouponEntity(
  {
    title: 'Cupón X',
    description: 'desc',
    discount: 10,
    state: 'AVAILABLE',
    isAvailable: true,
    validDays: 30,
    costInPoints: 50,
    rewardPartnerId: mockRewardPartner.id
  },
  mockRewardPartner
)
mockCoupon.costInPoints = 50
mockNeighbor.points = 100

function makeUseCase(dispatch: ReturnType<typeof vi.fn>): RedeemCouponUseCase {
  const repository = {
    save: async (tx: CouponTransactionEntity) => tx,
    find: async () => null
  } as unknown as CouponTransactionRepository
  const findCouponById = { exec: async () => mockCoupon } as unknown as FindCouponByIDUseCase
  const findNeighborById = { exec: async () => mockNeighbor } as unknown as FindNeighborByIDUseCase
  const findRewardPartnerById = { exec: async () => mockRewardPartner } as unknown as FindRewardPartnerByIdUseCase
  const subtractPoints = { exec: async () => {} } as unknown as SubtractNeighborPointsUseCase
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

  return new RedeemCouponUseCase(
    repository,
    findCouponById,
    findNeighborById,
    findRewardPartnerById,
    subtractPoints,
    notificationDispatcher
  )
}

describe('RedeemCouponUseCase — notificaciones', () => {
  it('dispara COUPON_PURCHASED al vecino que compró el cupón y al local dueño', async () => {
    const dispatch = vi.fn()
    const useCase = makeUseCase(dispatch)

    await useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })

    expect(dispatch).toHaveBeenCalledTimes(2)

    const neighborEvent = dispatch.mock.calls[0][0]
    expect(neighborEvent.recipientId).toBe(mockNeighbor.id)
    expect(neighborEvent.recipientRole).toBe(Roles.NEIGHBOR)
    expect(neighborEvent.category).toBe(NotificationCategory.COUPON_PURCHASED)
    expect(typeof neighborEvent.sendEmail).toBe('function')

    const rewardPartnerEvent = dispatch.mock.calls[1][0]
    expect(rewardPartnerEvent.recipientId).toBe(mockRewardPartner.id)
    expect(rewardPartnerEvent.recipientRole).toBe(Roles.REWARD_PARTNER)
    expect(rewardPartnerEvent.category).toBe(NotificationCategory.COUPON_PURCHASED)
    expect(rewardPartnerEvent.sendEmail).toBeUndefined()
  })
})

describe('RedeemCouponUseCase — canje duplicado', () => {
  it('rechaza el canje si el vecino ya tiene ese cupón ADQUIRIDO sin usar', async () => {
    const dispatch = vi.fn()
    const repository = {
      save: async (tx: CouponTransactionEntity) => tx,
      find: async () => ({}) as unknown as CouponTransactionEntity
    } as unknown as CouponTransactionRepository
    const findCouponById = { exec: async () => mockCoupon } as unknown as FindCouponByIDUseCase
    const findNeighborById = { exec: async () => mockNeighbor } as unknown as FindNeighborByIDUseCase
    const findRewardPartnerById = { exec: async () => mockRewardPartner } as unknown as FindRewardPartnerByIdUseCase
    const subtractPoints = { exec: async () => {} } as unknown as SubtractNeighborPointsUseCase
    const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

    const useCase = new RedeemCouponUseCase(
      repository,
      findCouponById,
      findNeighborById,
      findRewardPartnerById,
      subtractPoints,
      notificationDispatcher
    )

    await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toThrow(
      'Ya canjeaste este cupón. Usalo antes de volver a canjearlo'
    )
    expect(dispatch).not.toHaveBeenCalled()
  })
})
