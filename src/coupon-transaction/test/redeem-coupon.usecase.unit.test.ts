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
import ErrorCouponNotFound from '../../coupon/domain/errors/coupon-not-found.error'
import RedemptionPolicyResolver from '../domain/policies/redemption-policy.resolver'
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

interface UseCaseOverrides {
  /** Ids de cupones que el vecino ya tiene ADQUIRIDOS, según la policy. */
  heldCouponIds?: string[]
  findCoupon?: () => Promise<CouponEntity>
}

function makeUseCase(dispatch: ReturnType<typeof vi.fn>, overrides: UseCaseOverrides = {}): RedeemCouponUseCase {
  const repository = {
    save: async (tx: CouponTransactionEntity) => tx,
    findHeldCouponIds: async () => overrides.heldCouponIds ?? []
  } as unknown as CouponTransactionRepository
  const findCouponById = { exec: overrides.findCoupon ?? (async () => mockCoupon) } as unknown as FindCouponByIDUseCase
  const findNeighborById = { exec: async () => mockNeighbor } as unknown as FindNeighborByIDUseCase
  const findRewardPartnerById = { exec: async () => mockRewardPartner } as unknown as FindRewardPartnerByIdUseCase
  const subtractPoints = { exec: async () => {} } as unknown as SubtractNeighborPointsUseCase
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

  // Resolver real sobre un repositorio mockeado: así los tests ejercitan la
  // policy de verdad y no una copia de la regla escrita en el test.
  return new RedeemCouponUseCase(
    repository,
    findCouponById,
    findNeighborById,
    findRewardPartnerById,
    subtractPoints,
    notificationDispatcher,
    new RedemptionPolicyResolver(repository)
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
    const useCase = makeUseCase(dispatch, { heldCouponIds: [mockCoupon.id] })

    await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toThrow(
      'Ya canjeaste este cupón. Usalo antes de volver a canjearlo'
    )
    // El `code` numérico es lo que hace que el handler responda 409 y no 500:
    // si vuelve a ser un Error pelado, el canje repetido pasa por error de servidor.
    await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toMatchObject({
      code: 409
    })
    expect(dispatch).not.toHaveBeenCalled()
  })
})

// Todas estas son carreras reales: el vecino tiene el catálogo pintado y el
// estado cambia por debajo antes de que toque "Canjear". Ninguna puede terminar
// en un 500 — el front las usa para resincronizar la pantalla.
describe('RedeemCouponUseCase — el estado cambió mientras el vecino miraba', () => {
  it('rechaza con 409 si el local borró el cupón', async () => {
    const dispatch = vi.fn()
    const useCase = makeUseCase(dispatch, {
      findCoupon: async () => {
        throw new ErrorCouponNotFound(mockCoupon.id)
      }
    })

    await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toMatchObject({
      code: 409,
      message: 'Este cupón ya no está disponible.'
    })
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('rechaza con 409 si el cupón dejó de estar disponible', async () => {
    const dispatch = vi.fn()
    const disponibilidadOriginal = mockCoupon.isAvailable
    mockCoupon.isAvailable = false

    try {
      const useCase = makeUseCase(dispatch)
      await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toMatchObject({
        code: 409,
        message: 'Este cupón ya no está disponible.'
      })
      expect(dispatch).not.toHaveBeenCalled()
    } finally {
      mockCoupon.isAvailable = disponibilidadOriginal
    }
  })

  it('rechaza con 409 si el vecino gastó los puntos en otro lado', async () => {
    const dispatch = vi.fn()
    const puntosOriginales = mockNeighbor.points
    mockNeighbor.points = 10

    try {
      const useCase = makeUseCase(dispatch)
      await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toMatchObject({
        code: 409,
        message: 'No tenés puntos suficientes para canjear este cupón.'
      })
      expect(dispatch).not.toHaveBeenCalled()
    } finally {
      mockNeighbor.points = puntosOriginales
    }
  })

  // Un fallo de infraestructura NO es una carrera: tiene que seguir siendo 500,
  // porque el front no debe tocar el catálogo si el backend se cayó.
  it('deja pasar los errores que no son de negocio', async () => {
    const dispatch = vi.fn()
    const useCase = makeUseCase(dispatch, {
      findCoupon: async () => {
        throw new Error('DB caída')
      }
    })

    await expect(useCase.exec({ neighborId: mockNeighbor.id, couponId: mockCoupon.id })).rejects.toThrow('DB caída')
  })
})
