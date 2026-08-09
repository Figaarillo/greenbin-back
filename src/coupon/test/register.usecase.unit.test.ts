import { describe, expect, it, vi } from 'vitest'
import RegisterCouponUseCase from '../application/usecases/register.usecase'
import type CouponRepository from '../domain/repositories/coupon.repository'
import type FindRewardPartnerByIdUseCase from '../../reward-partner/application/usecases/find-by-id.usecase'
import type ListNeighborsUseCase from '../../neighbor/application/usecases/list.usecase'
import type NotificationDispatcher from '../../notification/application/service/notification-dispatcher.service'
import { NotificationCategory } from '../../notification/domain/enums/notification-category.enum'
import { Roles } from '../../auth/domain/entities/role'
import EntityEntity from '../../entity/domain/entities/entity.entity'
import RewardPartnerEntity from '../../reward-partner/domain/entities/reward-partner.entity'
import NeighborEntity from '../../neighbor/domain/entities/neighbor.entity'
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

const mockNeighbors = [
  new NeighborEntity('Ana', 'Gomez', 'ana', 'ana@test.com', 'p', 111, '123', new Date('1990-01-01'), mockEntity),
  new NeighborEntity('Bruno', 'Diaz', 'bruno', 'bruno@test.com', 'p', 222, '456', new Date('1990-01-01'), mockEntity)
]

function makeUseCase(
  dispatch: ReturnType<typeof vi.fn>,
  neighbors: NeighborEntity[] = mockNeighbors
): RegisterCouponUseCase {
  const repository = { save: async (coupon: CouponEntity) => coupon } as unknown as CouponRepository
  const findRewardPartner = { exec: async () => mockRewardPartner } as unknown as FindRewardPartnerByIdUseCase
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher
  const listNeighbors = { exec: async () => neighbors } as unknown as ListNeighborsUseCase

  return new RegisterCouponUseCase(repository, findRewardPartner, notificationDispatcher, listNeighbors)
}

describe('RegisterCouponUseCase — notificaciones', () => {
  it('dispara COUPON_CREATED al local que creó el cupón y a cada vecino de su entidad', async () => {
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

    expect(dispatch).toHaveBeenCalledTimes(1 + mockNeighbors.length)

    const rewardPartnerEvent = dispatch.mock.calls[0][0]
    expect(rewardPartnerEvent.recipientId).toBe(mockRewardPartner.id)
    expect(rewardPartnerEvent.recipientRole).toBe(Roles.REWARD_PARTNER)
    expect(rewardPartnerEvent.category).toBe(NotificationCategory.COUPON_CREATED)

    const neighborEvents = dispatch.mock.calls.slice(1).map(call => call[0])
    expect(neighborEvents).toHaveLength(mockNeighbors.length)
    neighborEvents.forEach((event, index) => {
      expect(event.recipientId).toBe(mockNeighbors[index].id)
      expect(event.recipientRole).toBe(Roles.NEIGHBOR)
      expect(event.category).toBe(NotificationCategory.COUPON_CREATED)
      expect(event.sendEmail).toBeUndefined()
    })
  })

  it('no rompe si la entidad todavía no tiene vecinos', async () => {
    const dispatch = vi.fn()
    const useCase = makeUseCase(dispatch, [])

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
  })
})
