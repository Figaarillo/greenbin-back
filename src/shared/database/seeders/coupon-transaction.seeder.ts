/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import { v4 as uuidv4 } from 'uuid'
import { addDays, subDays } from 'date-fns'
import CouponTransactionEntity from '../../../coupon-transaction/domain/entities/coupon-transaction.entity'
import type CouponEntity from '../../../coupon/domain/entities/coupon.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'

interface CouponTransactionSeed {
  couponTitle: string
  neighborUsername: string
  partnerUsername: string
  status: 'ADQUIRIDO' | 'UTILIZADO' | 'VENCIDO'
  daysAgo: number
}

const COUPON_TRANSACTION_SEEDS: CouponTransactionSeed[] = [
  {
    couponTitle: '10% de descuento en almacén',
    neighborUsername: 'cgomez',
    partnerUsername: 'carrefour_vm',
    status: 'UTILIZADO',
    daysAgo: 5
  },
  {
    couponTitle: '15% descuento en medicamentos',
    neighborUsername: 'amartinez',
    partnerUsername: 'farmacia_delpueblo',
    status: 'ADQUIRIDO',
    daysAgo: 1
  },
  {
    couponTitle: '25% en artículos de librería',
    neighborUsername: 'dsanchez',
    partnerUsername: 'libreria_estudiante',
    status: 'ADQUIRIDO',
    daysAgo: 2
  },
  {
    couponTitle: '20% de descuento en frescos',
    neighborUsername: 'vtorres',
    partnerUsername: 'carrefour_vm',
    status: 'VENCIDO',
    daysAgo: 20
  },
  {
    couponTitle: 'Kit escolar gratis',
    neighborUsername: 'pherrera',
    partnerUsername: 'libreria_estudiante',
    status: 'ADQUIRIDO',
    daysAgo: 1
  }
]

function generateCode(): string {
  return uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase()
}

async function seedCouponTransactions(
  em: EntityManager,
  coupons: CouponEntity[],
  neighbors: NeighborEntity[],
  rewardPartners: RewardPartnerEntity[]
): Promise<void> {
  const existing = await em.count(CouponTransactionEntity)
  if (existing > 0) {
    console.log(`[Seeder] CouponTransaction: ya existen ${existing} registros, se omite.`)
    return
  }

  const couponMap = new Map(coupons.map(c => [c.title, c]))
  const neighborMap = new Map(neighbors.map(n => [n.username, n]))
  const partnerMap = new Map(rewardPartners.map(p => [p.username, p]))

  const transactions: CouponTransactionEntity[] = []

  for (const seed of COUPON_TRANSACTION_SEEDS) {
    const coupon = couponMap.get(seed.couponTitle)
    const neighbor = neighborMap.get(seed.neighborUsername)
    const partner = partnerMap.get(seed.partnerUsername)

    if (coupon == null) throw new Error(`[Seeder] Coupon no encontrado: ${seed.couponTitle}`)
    if (neighbor == null) throw new Error(`[Seeder] Neighbor no encontrado: ${seed.neighborUsername}`)
    if (partner == null) throw new Error(`[Seeder] RewardPartner no encontrado: ${seed.partnerUsername}`)

    const adquisitionDate = subDays(new Date(), seed.daysAgo)
    const expirationDate = addDays(adquisitionDate, coupon.validDays)
    const redeemDate = seed.status === 'UTILIZADO' ? subDays(new Date(), seed.daysAgo - 2) : undefined

    const ct = new CouponTransactionEntity(
      generateCode(),
      seed.status,
      adquisitionDate,
      redeemDate,
      expirationDate,
      coupon.costInPoints,
      coupon,
      neighbor,
      partner
    )

    // Descontar puntos del vecino si adquirió el cupón
    if (seed.status === 'ADQUIRIDO' || seed.status === 'UTILIZADO') {
      const updatePayload: { points: number } = { points: coupon.costInPoints }
      neighbor.update(updatePayload as never)
    }

    transactions.push(ct)
  }

  await em.persistAndFlush(transactions)
  console.log(`[Seeder] CouponTransaction: ${transactions.length} transacciones de cupones creadas.`)
}

export default seedCouponTransactions
