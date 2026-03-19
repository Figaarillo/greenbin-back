/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import type RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'

const COUPON_SEEDS = [
  {
    title: '10% de descuento en almacén',
    description: 'Descuento del 10% en productos de almacén y bebidas en Carrefour.',
    discount: 10,
    isAvailable: true,
    validDays: 30,
    costInPoints: 150,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'carrefour_vm'
  },
  {
    title: '20% de descuento en frescos',
    description: 'Descuento del 20% en frutas, verduras y carnes en Carrefour.',
    discount: 20,
    isAvailable: true,
    validDays: 15,
    costInPoints: 250,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'carrefour_vm'
  },
  {
    title: '15% descuento en medicamentos',
    description: 'Descuento del 15% en medicamentos de venta libre en Farmacia Del Pueblo.',
    discount: 15,
    isAvailable: true,
    validDays: 60,
    costInPoints: 200,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'farmacia_delpueblo'
  },
  {
    title: 'Kit escolar gratis',
    description: 'Canje por un kit escolar básico (cuaderno, lapicera y lápiz) en Librería El Estudiante.',
    discount: 100,
    isAvailable: true,
    validDays: 90,
    costInPoints: 400,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'libreria_estudiante'
  },
  {
    title: '25% en artículos de librería',
    description: 'Descuento del 25% en toda la línea de útiles escolares en Librería El Estudiante.',
    discount: 25,
    isAvailable: true,
    validDays: 45,
    costInPoints: 300,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'libreria_estudiante'
  }
]

async function seedCoupons(em: EntityManager, rewardPartners: RewardPartnerEntity[]): Promise<CouponEntity[]> {
  const existing = await em.count(CouponEntity)
  if (existing > 0) {
    console.log(`[Seeder] Coupon: ya existen ${existing} registros, se omite.`)
    return await em.find(CouponEntity, {})
  }

  const partnerMap = new Map(rewardPartners.map(p => [p.username, p]))

  const coupons = COUPON_SEEDS.map(({ partnerUsername, ...data }) => {
    const partner = partnerMap.get(partnerUsername)
    if (partner == null) throw new Error(`[Seeder] RewardPartner no encontrado: ${partnerUsername}`)
    return new CouponEntity(data, partner)
  })

  await em.persistAndFlush(coupons)
  console.log(`[Seeder] Coupon: ${coupons.length} cupones creados.`)
  return coupons
}

export default seedCoupons
