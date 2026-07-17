import { describe, expect, it, vi } from 'vitest'
import NotifyExpiringCouponsUseCase from '../application/usecases/notify-expiring-coupons.usecase'
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

function makeTransaction(): CouponTransactionEntity {
  const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  return new CouponTransactionEntity(
    '123456',
    CouponTransactionStatus.ADQUIRIDO,
    new Date(),
    undefined,
    soon,
    50,
    mockCoupon,
    mockNeighbor,
    mockRewardPartner
  )
}

function makeUseCase(
  transactions: CouponTransactionEntity[],
  dispatch: ReturnType<typeof vi.fn>,
  markExpirationNotified: ReturnType<typeof vi.fn>
): NotifyExpiringCouponsUseCase {
  const repository = {
    findExpiringSoon: async () => transactions,
    markExpirationNotified
  } as unknown as CouponTransactionRepository
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

  return new NotifyExpiringCouponsUseCase(repository, notificationDispatcher)
}

describe('NotifyExpiringCouponsUseCase', () => {
  it('dispara COUPON_EXPIRING_SOON al vecino por cada transacción por vencer', async () => {
    const transaction = makeTransaction()
    const dispatch = vi.fn()
    const markExpirationNotified = vi.fn()
    const useCase = makeUseCase([transaction], dispatch, markExpirationNotified)

    const count = await useCase.exec()

    expect(count).toBe(1)
    expect(dispatch).toHaveBeenCalledTimes(1)
    const event = dispatch.mock.calls[0][0]
    expect(event.recipientId).toBe(mockNeighbor.id)
    expect(event.recipientRole).toBe(Roles.NEIGHBOR)
    expect(event.category).toBe(NotificationCategory.COUPON_EXPIRING_SOON)
    expect(typeof event.sendEmail).toBe('function')
  })

  it('marca la transacción como notificada después de despachar', async () => {
    const transaction = makeTransaction()
    const dispatch = vi.fn()
    const markExpirationNotified = vi.fn()
    const useCase = makeUseCase([transaction], dispatch, markExpirationNotified)

    await useCase.exec()

    expect(markExpirationNotified).toHaveBeenCalledWith(transaction.id)
  })

  it('sin transacciones por vencer, no dispara nada y devuelve 0', async () => {
    const dispatch = vi.fn()
    const markExpirationNotified = vi.fn()
    const useCase = makeUseCase([], dispatch, markExpirationNotified)

    const count = await useCase.exec()

    expect(count).toBe(0)
    expect(dispatch).not.toHaveBeenCalled()
    expect(markExpirationNotified).not.toHaveBeenCalled()
  })

  it('acepta un withinDays custom y lo reenvía al repositorio', async () => {
    const dispatch = vi.fn()
    const markExpirationNotified = vi.fn()
    const findExpiringSoon = vi.fn(async () => [])
    const repository = { findExpiringSoon, markExpirationNotified } as unknown as CouponTransactionRepository
    const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher
    const useCase = new NotifyExpiringCouponsUseCase(repository, notificationDispatcher)

    await useCase.exec(5)

    expect(findExpiringSoon).toHaveBeenCalledWith(5)
  })
})
