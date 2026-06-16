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
  status: 'ADQUIRIDO' | 'USADO' | 'EXPIRADO'
  daysAgo: number
}

const COUPON_TRANSACTION_SEEDS: CouponTransactionSeed[] = [
  {
    couponTitle: '10% en productos de almacén El Progreso',
    neighborUsername: 'emattalia',
    partnerUsername: 'almacen_elprogreso',
    status: 'EXPIRADO',
    daysAgo: 41
  },
  {
    couponTitle: '20% en productos de limpieza - El Progreso',
    neighborUsername: 'emattalia',
    partnerUsername: 'almacen_elprogreso',
    status: 'EXPIRADO',
    daysAgo: 41
  },
  {
    couponTitle: 'Llevar 3 y pagar 2 en gaseosas - El Progreso',
    neighborUsername: 'emattalia',
    partnerUsername: 'almacen_elprogreso',
    status: 'USADO',
    daysAgo: 13
  },
  {
    couponTitle: '15% en fiambres y lácteos - Don Juan',
    neighborUsername: 'emattalia',
    partnerUsername: 'alm_donjuan',
    status: 'USADO',
    daysAgo: 9
  },
  {
    couponTitle: '10% en compras mayores a $5000 - Don Juan',
    neighborUsername: 'emattalia',
    partnerUsername: 'alm_donjuan',
    status: 'USADO',
    daysAgo: 9
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
    const redeemDate = seed.status === 'USADO' ? subDays(new Date(), seed.daysAgo - 2) : undefined

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

    if (seed.status === 'ADQUIRIDO' || seed.status === 'USADO') {
      const updatePayload: { points: number } = { points: coupon.costInPoints }
      neighbor.update(updatePayload as never)
    }

    transactions.push(ct)
  }

  await em.persistAndFlush(transactions)
  console.log(`[Seeder] CouponTransaction: ${transactions.length} transacciones de cupones creadas.`)
}

export default seedCouponTransactions
