import { describe, expect, it, vi } from 'vitest'
import ListNeighborCatalogUseCase from '../application/usecases/list-neighbor-catalog.usecase'
import RedemptionPolicyResolver from '../domain/policies/redemption-policy.resolver'
import type CouponTransactionRepository from '../domain/repositories/coupon-transaction.repository'
import type ListAvailableCouponUseCase from '../../coupon/application/usecases/list-available-coupon.usecase'
import CouponEntity from '../../coupon/domain/entities/coupon.entity'
import EntityEntity from '../../entity/domain/entities/entity.entity'
import RewardPartnerEntity from '../../reward-partner/domain/entities/reward-partner.entity'

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

function makeCoupon(title: string): CouponEntity {
  return new CouponEntity(
    {
      title,
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
}

const NEIGHBOR_ID = 'neighbor-1'

function makeUseCase(
  coupons: CouponEntity[],
  heldCouponIds: string[]
): { useCase: ListNeighborCatalogUseCase; findHeldCouponIds: ReturnType<typeof vi.fn> } {
  const findHeldCouponIds = vi.fn(async () => heldCouponIds)
  const repository = { findHeldCouponIds } as unknown as CouponTransactionRepository
  const listAvailable = { exec: async () => coupons } as unknown as ListAvailableCouponUseCase

  return {
    useCase: new ListNeighborCatalogUseCase(listAvailable, new RedemptionPolicyResolver(repository)),
    findHeldCouponIds
  }
}

describe('ListNeighborCatalogUseCase', () => {
  it('marca como no canjeable el cupón que el vecino ya tiene adquirido', async () => {
    const canjeado = makeCoupon('Ya lo tengo')
    const libre = makeCoupon('Disponible')
    const { useCase } = makeUseCase([canjeado, libre], [canjeado.id])

    const catalog = await useCase.exec(NEIGHBOR_ID, NaN, NaN)

    expect(catalog.find(c => c.id === canjeado.id)).toMatchObject({
      redeemable: false,
      reason: 'Ya canjeado'
    })
    expect(catalog.find(c => c.id === libre.id)).toMatchObject({ redeemable: true })
  })

  it('deja todos canjeables cuando el vecino no tiene ninguno adquirido', async () => {
    const coupons = [makeCoupon('A'), makeCoupon('B')]
    const { useCase } = makeUseCase(coupons, [])

    const catalog = await useCase.exec(NEIGHBOR_ID, NaN, NaN)

    expect(catalog.every(c => c.redeemable)).toBe(true)
    expect(catalog.every(c => c.reason === undefined)).toBe(true)
  })

  // Si esto se rompe, el catálogo pasa a hacer una consulta por cupón: con 50
  // cupones en pantalla son 50 queries por cada vez que el vecino entra.
  it('resuelve todo el catálogo con una sola consulta a la base', async () => {
    const coupons = [makeCoupon('A'), makeCoupon('B'), makeCoupon('C'), makeCoupon('D')]
    const { useCase, findHeldCouponIds } = makeUseCase(coupons, [])

    await useCase.exec(NEIGHBOR_ID, NaN, NaN)

    expect(findHeldCouponIds).toHaveBeenCalledTimes(1)
    expect(findHeldCouponIds).toHaveBeenCalledWith(
      NEIGHBOR_ID,
      coupons.map(c => c.id)
    )
  })

  // El front usa este id para pedir los datos del local y dibujar el mapa.
  it('expone rewardPartner como id plano', async () => {
    const coupon = makeCoupon('A')
    const { useCase } = makeUseCase([coupon], [])

    const [entry] = await useCase.exec(NEIGHBOR_ID, NaN, NaN)

    expect(entry.rewardPartner).toBe(mockRewardPartner.id)
  })
})
