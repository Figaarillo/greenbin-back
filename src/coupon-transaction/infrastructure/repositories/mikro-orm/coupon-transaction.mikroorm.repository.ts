import { RequestContext } from '@mikro-orm/core'
import type { EntityManager } from '@mikro-orm/postgresql'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import CouponTransactionEntity from '../../../domain/entities/coupon-transaction.entity'
import type CouponTransactionRepository from '../../../domain/repositories/coupon-transaction.repository'
import type RewardPartnerStats from '../../../domain/types/reward-partner-stats.type'

class CouponTransactionMikroORMRepository implements CouponTransactionRepository {
  list!: (offset?: number | undefined, limit?: number | undefined) => Promise<Nullable<CouponTransactionEntity[]>>

  async find(property: Record<string, string>): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(CouponTransactionEntity, property)
  }

  // Lecturas de historial: desactivamos el filtro 'active' para que los maestros
  // referenciados (coupon, rewardPartner, neighbor) se populen aunque estén dados
  // de baja. Si no, el populate los traería null y rompería el render del histórico.
  async findByNeighbor(neighborId: string, offset?: number, limit?: number): Promise<CouponTransactionEntity[]> {
    const em = this.getEntityManager()
    return await em.find(
      CouponTransactionEntity,
      { neighbor: neighborId },
      {
        populate: ['coupon', 'rewardPartner'],
        filters: { active: false },
        ...(offset != null ? { offset } : {}),
        ...(limit != null ? { limit } : {})
      }
    )
  }

  async findByRewardPartner(
    rewardPartnerId: string,
    offset?: number,
    limit?: number
  ): Promise<CouponTransactionEntity[]> {
    const em = this.getEntityManager()
    return await em.find(
      CouponTransactionEntity,
      { rewardPartner: rewardPartnerId },
      {
        populate: ['coupon', 'neighbor'],
        filters: { active: false },
        ...(offset != null ? { offset } : {}),
        ...(limit != null ? { limit } : {})
      }
    )
  }

  async findById(id: string): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(
      CouponTransactionEntity,
      { id },
      { populate: ['coupon', 'rewardPartner', 'neighbor'], filters: { active: false } }
    )
  }

  async findByCode(code: string): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(
      CouponTransactionEntity,
      { code },
      { populate: ['coupon', 'rewardPartner', 'neighbor'], filters: { active: false } }
    )
  }

  async save(transaction: CouponTransactionEntity): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    await em.persist(transaction).flush()
    return transaction
  }

  async update(id: string, transaction: CouponTransactionEntity): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()

    const entity = await em.findOne(CouponTransactionEntity, { id })
    if (entity == null) return null

    entity.status = transaction.status
    entity.redeemDate = transaction.redeemDate
    await em.flush()

    return entity
  }

  async getRewardPartnerStats(rewardPartnerId: string, from?: Date, to?: Date): Promise<RewardPartnerStats> {
    const knex = this.getKnex()

    // Primera visita de cada vecino a ESTE local, sin filtro de fecha: sirve
    // para distinguir "vecino nuevo" (su primera visita cayó en el período
    // filtrado) de un vecino recurrente, sin importar qué rango se esté
    // mirando en la pantalla.
    const firstVisitRows = await knex('coupon_transactions')
      .where('reward_partner_id', rewardPartnerId)
      .andWhere('status', 'USADO')
      .groupBy('neighbor_id')
      .select('neighbor_id as neighborId', knex.raw('MIN(redeem_date) as "firstVisit"'))

    const firstVisitByNeighbor = new Map<string, number>()
    for (const row of firstVisitRows as Array<{ neighborId: string; firstVisit: string }>) {
      firstVisitByNeighbor.set(row.neighborId, new Date(row.firstVisit).getTime())
    }

    const rowsQuery = knex('coupon_transactions as ct')
      .join('coupon as c', 'ct.coupon_id', 'c.id')
      .where('ct.reward_partner_id', rewardPartnerId)
      .select(
        'ct.status as status',
        'ct.coupon_id as couponId',
        'c.title as couponTitle',
        'c.discount as couponDiscount',
        'ct.neighbor_id as neighborId',
        'ct.redeem_date as redeemDate',
        'ct.cost_in_points as costInPoints'
      )

    // Mismo criterio de fecha que usaba el filtro client-side: la fecha "de
    // referencia" de una transacción es redeem_date si existe, si no
    // adquisition_date, si no created_at.
    const dateRef = knex.raw('COALESCE(ct.redeem_date, ct.adquisition_date, ct.created_at)')
    if (from != null) rowsQuery.andWhere(dateRef, '>=', from)
    if (to != null) rowsQuery.andWhere(dateRef, '<=', to)

    const rows = (await rowsQuery) as Array<{
      status: string
      couponId: string
      couponTitle: string
      couponDiscount: number
      neighborId: string
      redeemDate: string | null
      costInPoints: number
    }>

    const totalAdquirido = rows.filter(r => r.status === 'ADQUIRIDO').length
    const totalUsado = rows.filter(r => r.status === 'USADO').length
    const totalExpirado = rows.filter(r => r.status === 'EXPIRADO').length
    const totalPuntos = rows.filter(r => r.status === 'USADO').reduce((sum, r) => sum + (r.costInPoints ?? 0), 0)

    const discountRanges = { lt25: 0, from25to50: 0, from50to75: 0, gt75: 0 }
    for (const r of rows) {
      const d = r.couponDiscount ?? 0
      if (d < 25) discountRanges.lt25++
      else if (d < 50) discountRanges.from25to50++
      else if (d < 75) discountRanges.from50to75++
      else discountRanges.gt75++
    }

    const usados = rows.filter(r => r.status === 'USADO' && r.redeemDate != null)
    const isFirstVisit = (r: (typeof usados)[number]): boolean =>
      r.redeemDate != null && firstVisitByNeighbor.get(r.neighborId) === new Date(r.redeemDate).getTime()

    const uniqueNeighbors = new Set(usados.map(r => r.neighborId)).size
    const newNeighbors = usados.filter(isFirstVisit).length
    const avgVisitsPerNeighbor = uniqueNeighbors > 0 ? usados.length / uniqueNeighbors : 0

    const byCouponMap = new Map<
      string,
      {
        couponId: string
        title: string
        redemptions: number
        neighbors: Set<string>
        newNeighbors: number
        pointsSpent: number
      }
    >()
    for (const r of usados) {
      const entry = byCouponMap.get(r.couponId) ?? {
        couponId: r.couponId,
        title: r.couponTitle,
        redemptions: 0,
        neighbors: new Set<string>(),
        newNeighbors: 0,
        pointsSpent: 0
      }
      entry.redemptions++
      entry.neighbors.add(r.neighborId)
      entry.pointsSpent += r.costInPoints ?? 0
      if (isFirstVisit(r)) entry.newNeighbors++
      byCouponMap.set(r.couponId, entry)
    }

    const byCoupon = Array.from(byCouponMap.values())
      .map(({ neighbors, ...rest }) => ({ ...rest, uniqueNeighbors: neighbors.size }))
      .sort((a, b) => b.newNeighbors - a.newNeighbors)

    return {
      totalAdquirido,
      totalUsado,
      totalExpirado,
      totalPuntos,
      discountRanges,
      uniqueNeighbors,
      newNeighbors,
      avgVisitsPerNeighbor,
      byCoupon
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getEntityManager() {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new ErrorEntityManagerNotFound()
    }

    return em
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getKnex() {
    const em = RequestContext.getEntityManager() as EntityManager
    if (em == null) {
      throw new ErrorEntityManagerNotFound()
    }
    return em.getKnex()
  }
}

export default CouponTransactionMikroORMRepository
