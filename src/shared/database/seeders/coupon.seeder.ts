/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import type RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'

const COUPON_SEEDS = [
  // Supermercado Etruria
  {
    title: '10% en compras superiores a $8000 - Etruria',
    description: 'Descuento del 10% presentando este cupón en compras mayores a $8000.',
    discount: 10,
    isAvailable: true,
    validDays: 30,
    costInPoints: 120,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'super_etruria'
  },
  {
    title: '15% en productos de almacén - Etruria',
    description: 'Descuento del 15% en fideos, arroz, enlatados y productos de almacén.',
    discount: 15,
    isAvailable: true,
    validDays: 20,
    costInPoints: 150,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'super_etruria'
  },
  {
    title: '2x1 en gaseosas de 1.5L - Etruria',
    description: 'Llevá dos gaseosas de 1.5L al precio de una.',
    discount: 50,
    isAvailable: true,
    validDays: 15,
    costInPoints: 130,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'super_etruria'
  },
  {
    title: '20% en artículos de limpieza - Etruria',
    description: 'Descuento del 20% en detergentes, lavandina y productos de limpieza.',
    discount: 20,
    isAvailable: false,
    validDays: 30,
    costInPoints: 200,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'super_etruria'
  },
  // Pollería Santa Lucía
  {
    title: '15% en pollo entero - Santa Lucía',
    description: 'Descuento del 15% en pollo entero fresco.',
    discount: 15,
    isAvailable: true,
    validDays: 10,
    costInPoints: 130,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'poll_santalucia'
  },
  {
    title: '20% en milanesas de pollo - Santa Lucía',
    description: 'Descuento del 20% en milanesas de pollo caseras.',
    discount: 20,
    isAvailable: true,
    validDays: 7,
    costInPoints: 150,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'poll_santalucia'
  },
  {
    title: 'Docena de huevos gratis - Santa Lucía',
    description: 'Canjeá este cupón por una docena de huevos frescos.',
    discount: 100,
    isAvailable: true,
    validDays: 14,
    costInPoints: 90,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'poll_santalucia'
  },
  // Verdulería Silveira
  {
    title: '20% en frutas de estación - Silveira',
    description: 'Descuento del 20% en frutas frescas de estación.',
    discount: 20,
    isAvailable: true,
    validDays: 7,
    costInPoints: 100,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'verd_silveira'
  },
  {
    title: '15% en verduras de hoja - Silveira',
    description: 'Descuento del 15% en lechuga, acelga, espinaca y verduras de hoja.',
    discount: 15,
    isAvailable: true,
    validDays: 5,
    costInPoints: 90,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'verd_silveira'
  },
  {
    title: '1kg de papas gratis - Silveira',
    description: 'Canjeá este cupón por 1kg de papas.',
    discount: 100,
    isAvailable: true,
    validDays: 10,
    costInPoints: 80,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'verd_silveira'
  },
  // Bar La Cabra
  {
    title: '2x1 en cerveza artesanal - La Cabra',
    description: 'Llevá dos pintas de cerveza artesanal al precio de una.',
    discount: 50,
    isAvailable: true,
    validDays: 20,
    costInPoints: 160,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'bar_lacabra'
  },
  {
    title: 'Café con leche + medialunas - La Cabra',
    description: 'Un café con leche y dos medialunas sin cargo con cualquier consumo.',
    discount: 100,
    isAvailable: true,
    validDays: 7,
    costInPoints: 70,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'bar_lacabra'
  },
  {
    title: '15% en picadas para dos - La Cabra',
    description: 'Descuento del 15% en picadas para compartir entre dos personas.',
    discount: 15,
    isAvailable: true,
    validDays: 30,
    costInPoints: 140,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'bar_lacabra'
  },
  {
    title: '20% en tragos de autor - La Cabra',
    description: 'Descuento del 20% en la carta de tragos de autor.',
    discount: 20,
    isAvailable: true,
    validDays: 15,
    costInPoints: 180,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'bar_lacabra'
  },
  {
    title: 'Cena para dos con vino incluido - La Cabra',
    description: 'Canjeá este cupón por una cena para dos personas con una botella de vino incluida.',
    discount: 100,
    isAvailable: true,
    validDays: 20,
    costInPoints: 185,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'bar_lacabra'
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
