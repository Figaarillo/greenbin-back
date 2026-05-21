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
  neighborUsername?: string
  neighborEmail?: string
  partnerUsername: string
  status: 'ADQUIRIDO' | 'UTILIZADO' | 'VENCIDO'
  daysAgo: number
}

const COUPON_TRANSACTION_SEEDS: CouponTransactionSeed[] = []

function generateCode(): string {
  return uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase()
}

async function seedCouponTransactions(
  em: EntityManager,
  coupons: CouponEntity[],
  neighbors: NeighborEntity[],
  rewardPartners: RewardPartnerEntity[]
): Promise<void> {
  const couponMap = new Map(coupons.map(c => [c.title, c]))
  const neighborByUsernameMap = new Map(neighbors.map(n => [n.username, n]))
  const neighborByEmailMap = new Map(neighbors.map(n => [n.email, n]))
  const partnerMap = new Map(rewardPartners.map(p => [p.username, p]))

  // Obtener IDs de vecinos que ya tienen transacciones de cupones para no duplicar
  const existingTransactions = await em.find(CouponTransactionEntity, {}, { fields: ['neighbor'] })
  const neighborsWithCouponTransactions = new Set(existingTransactions.map(t => t.neighbor.id))

  const transactions: CouponTransactionEntity[] = []
  let skipped = 0

  for (const seed of COUPON_TRANSACTION_SEEDS) {
    const coupon = couponMap.get(seed.couponTitle)
    const neighbor =
      seed.neighborUsername != null
        ? neighborByUsernameMap.get(seed.neighborUsername)
        : neighborByEmailMap.get(seed.neighborEmail ?? '')
    const partner = partnerMap.get(seed.partnerUsername)

    if (coupon == null) throw new Error(`[Seeder] Coupon no encontrado: ${seed.couponTitle}`)
    if (neighbor == null)
      throw new Error(`[Seeder] Neighbor no encontrado: ${seed.neighborUsername ?? seed.neighborEmail}`)
    if (partner == null) throw new Error(`[Seeder] RewardPartner no encontrado: ${seed.partnerUsername}`)

    if (neighborsWithCouponTransactions.has(neighbor.id)) {
      skipped++
      continue
    }

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
  console.log(
    `[Seeder] CouponTransaction: ${transactions.length} transacciones creadas, ${skipped} omitidas (vecino ya tenía datos).`
  )
}

export default seedCouponTransactions
