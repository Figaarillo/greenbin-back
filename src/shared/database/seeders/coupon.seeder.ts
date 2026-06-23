/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import type RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'

const COUPON_SEEDS = [
  {
    title: '10% en herramientas de mano',
    description: 'Descuento del 10% en martillos, destornilladores, llaves y más.',
    discount: 10,
    isAvailable: true,
    validDays: 45,
    costInPoints: 180,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'ferr_progreso'
  },
  {
    title: '15% en pinturas y revestimientos',
    description: 'Descuento del 15% en pinturas látex, esmalte y revestimientos.',
    discount: 15,
    isAvailable: true,
    validDays: 30,
    costInPoints: 220,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'ferr_progreso'
  },
  {
    title: '20% en artículos de jardín',
    description: 'Descuento del 20% en mangueras, macetas, sustratos y herramientas de jardín.',
    discount: 20,
    isAvailable: true,
    validDays: 30,
    costInPoints: 250,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'ferr_progreso'
  },
  {
    title: '2x1 en protector solar',
    description: 'Llevá dos protectores solares al precio de uno.',
    discount: 50,
    isAvailable: true,
    validDays: 20,
    costInPoints: 160,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'farm_sanroque'
  },
  {
    title: '20% en vitaminas y suplementos',
    description: 'Descuento del 20% en vitaminas, minerales y suplementos nutricionales.',
    discount: 20,
    isAvailable: true,
    validDays: 45,
    costInPoints: 220,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'farm_sanroque'
  },
  {
    title: '15% en medicamentos de venta libre',
    description: 'Descuento del 15% en analgésicos, antigripales y medicamentos sin receta.',
    discount: 15,
    isAvailable: true,
    validDays: 60,
    costInPoints: 200,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'farm_sanroque'
  },
  {
    title: '10% en productos de higiene personal',
    description: 'Descuento del 10% en shampoo, cremas, desodorantes y cuidado personal.',
    discount: 10,
    isAvailable: true,
    validDays: 30,
    costInPoints: 100,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'farm_sanroque'
  },
  {
    title: '15% en pan artesanal - La Espiga',
    description: 'Descuento del 15% en toda la línea de panes artesanales.',
    discount: 15,
    isAvailable: true,
    validDays: 14,
    costInPoints: 110,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'pan_laespiga'
  },
  {
    title: 'Café + medialunas gratis - La Espiga',
    description: 'Un café y dos medialunas sin cargo con cualquier compra.',
    discount: 100,
    isAvailable: true,
    validDays: 7,
    costInPoints: 70,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'pan_laespiga'
  },
  {
    title: '20% en tortas y pasteles - La Espiga',
    description: 'Descuento del 20% en tortas, pasteles y alfajores de la casa.',
    discount: 20,
    isAvailable: true,
    validDays: 10,
    costInPoints: 140,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'pan_laespiga'
  },
  {
    title: 'Media docena de medialunas gratis - La Espiga',
    description: 'Canjeá este cupón por media docena de medialunas de manteca.',
    discount: 100,
    isAvailable: true,
    validDays: 7,
    costInPoints: 90,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'pan_laespiga'
  },
  {
    title: '10% en compras mayores a $5000 - Don Juan',
    description: 'Presentá este cupón y obtené 10% de descuento en compras superiores a $5000.',
    discount: 10,
    isAvailable: true,
    validDays: 30,
    costInPoints: 120,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'alm_donjuan'
  },
  {
    title: 'Botella de agua gratis - Don Juan',
    description: 'Canjeá este cupón por una botella de agua de 500ml sin cargo.',
    discount: 100,
    isAvailable: true,
    validDays: 15,
    costInPoints: 80,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'alm_donjuan'
  },
  {
    title: '15% en fiambres y lácteos - Don Juan',
    description: 'Descuento del 15% en fiambres, quesos y productos lácteos.',
    discount: 15,
    isAvailable: true,
    validDays: 10,
    costInPoints: 130,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'alm_donjuan'
  },
  {
    title: 'Llevar 3 y pagar 2 en gaseosas - El Progreso',
    description: 'Comprá 3 gaseosas de 1.5L y pagá solo 2.',
    discount: 33,
    isAvailable: true,
    validDays: 15,
    costInPoints: 150,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'almacen_elprogreso'
  },
  {
    title: '10% en productos de almacén El Progreso',
    description: 'Descuento del 10% en productos de almacén y bebidas.',
    discount: 10,
    isAvailable: false,
    validDays: 30,
    costInPoints: 100,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'almacen_elprogreso'
  },
  {
    title: '20% en productos de limpieza - El Progreso',
    description: 'Descuento del 20% en artículos de limpieza y detergentes.',
    discount: 20,
    isAvailable: true,
    validDays: 20,
    costInPoints: 200,
    state: 'AVAILABLE',
    rewardPartnerId: '',
    partnerUsername: 'almacen_elprogreso'
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
