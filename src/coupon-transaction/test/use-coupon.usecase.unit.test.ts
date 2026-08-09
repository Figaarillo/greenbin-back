import { describe, expect, it, vi } from 'vitest'
import UseCouponUseCase from '../application/usecases/use-coupon.usecase'
import type CouponTransactionRepository from '../domain/repositories/coupon-transaction.repository'
import type NotificationDispatcher from '../../notification/application/service/notification-dispatcher.service'
import { NotificationCategory } from '../../notification/domain/enums/notification-category.enum'
import { Roles } from '../../auth/domain/entities/role'
import { CouponTransactionStatus } from '../domain/states'
import EntityEntity from '../../entity/domain/entities/entity.entity'
import NeighborEntity from '../../neighbor/domain/entities/neighbor.entity'
import RewardPartnerEntity from '../../reward-partner/domain/entities/reward-partner.entity'
import CouponEntity from '../../coupon/domain/entities/coupon.entity'
import CouponTransactionEntity from '../domain/entities/coupon-transaction.entity'

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

const futureExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000)

function makeTransaction(): CouponTransactionEntity {
  return new CouponTransactionEntity(
    '123456',
    CouponTransactionStatus.ADQUIRIDO,
    new Date(),
    undefined,
    futureExpiration,
    50,
    mockCoupon,
    mockNeighbor,
    mockRewardPartner
  )
}

function makeUseCase(dispatch: ReturnType<typeof vi.fn>, transaction: CouponTransactionEntity): UseCouponUseCase {
  const repository = {
    findByCode: async () => transaction,
    update: async () => {},
    findById: async () => transaction
  } as unknown as CouponTransactionRepository
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

  return new UseCouponUseCase(repository, notificationDispatcher)
}

describe('UseCouponUseCase — notificaciones', () => {
  it('dispara COUPON_REDEEMED al vecino dueño de la transacción', async () => {
    const dispatch = vi.fn()
    const transaction = makeTransaction()
    const useCase = makeUseCase(dispatch, transaction)

    await useCase.exec({ code: transaction.code, rewardPartnerId: mockRewardPartner.id })

    expect(dispatch).toHaveBeenCalledTimes(1)
    const event = dispatch.mock.calls[0][0]
    expect(event.recipientId).toBe(mockNeighbor.id)
    expect(event.recipientRole).toBe(Roles.NEIGHBOR)
    expect(event.category).toBe(NotificationCategory.COUPON_REDEEMED)
    expect(typeof event.sendEmail).toBe('function')
  })
})
