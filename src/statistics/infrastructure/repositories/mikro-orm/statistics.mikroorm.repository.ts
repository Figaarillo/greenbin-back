import { RequestContext } from '@mikro-orm/core'
import type { EntityManager } from '@mikro-orm/postgresql'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type StatisticsRepository from '../../../domain/repositories/statistics.repository'
import type TotalRecycled from '../../../domain/types/total-recycled.type'
import type GreenPointRanking from '../../../domain/types/green-point-ranking.type'
import type WasteByCategory from '../../../domain/types/waste-by-category.type'
import type WasteByPeriod from '../../../domain/types/waste-by-period.type'
import type NeighborDelivery from '../../../domain/types/neighbor-delivery.type'
import type NeighborRanking from '../../../domain/types/neighbor-ranking.type'
import type EntityCounts from '../../../domain/types/entity-counts.type'
import type RewardPartnerRanking from '../../../domain/types/reward-partner-ranking.type'
import type Co2Avoided from '../../../domain/types/co2-avoided.type'
import type PointsBalance from '../../../domain/types/points-balance.type'

// Estados de `coupon_transactions.status`.
const USED = 'USADO'
const ACQUIRED = 'ADQUIRIDO'
const EXPIRED = 'EXPIRADO'

class StatisticsMikroORMRepository implements StatisticsRepository {
  async getTotalRecycled(entityId: string, from?: Date, to?: Date): Promise<TotalRecycled> {
    const knex = this.getKnex()

    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .where('gp.entity_id', entityId)
      .select(
        knex.raw('COALESCE(SUM(wtd.weight), 0)::float as "totalWeight"'),
        knex.raw('COALESCE(SUM(wtd.points), 0)::int as "totalPoints"'),
        knex.raw('COUNT(DISTINCT wt.id)::int as "totalTransactions"')
      )

    if (from != null) query.where('wt.date', '>=', from)
    if (to != null) query.where('wt.date', '<=', to)

    const result = await query.first()
    return {
      totalWeight: result?.totalWeight ?? 0,
      totalPoints: result?.totalPoints ?? 0,
      totalTransactions: result?.totalTransactions ?? 0
    }
  }

  async getEntityCounts(entityId: string): Promise<EntityCounts> {
    const knex = this.getKnex()

    // Un solo round-trip en vez de bajarse las cuatro listas completas al front
    // para hacerles `.length` (que además truncaba en el limit de paginación).
    const countOf = async (table: string): Promise<number> => {
      const row = (await knex(table)
        .where('entity_id', entityId)
        .where('is_active', true)
        .count('* as count')
        .first()) as { count?: string | number } | undefined
      return Number(row?.count ?? 0)
    }

    const [greenPoints, responsibles, neighbors, rewardPartners] = await Promise.all([
      countOf('green_point_entity'),
      countOf('responsible_entity'),
      countOf('neighbors'),
      countOf('reward_partner_entity')
    ])

    return { greenPoints, responsibles, neighbors, rewardPartners }
  }

  async getPointsBalance(entityId: string): Promise<PointsBalance> {
    const knex = this.getKnex()

    // Sin rango de fechas a propósito: la circulación de puntos es un saldo
    // acumulado, no una métrica del período. Acotarla a 30 días daría un número
    // sin sentido — los vecinos gastan puntos que ganaron hace meses.
    const granted = await knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .where('gp.entity_id', entityId)
      .select(knex.raw('COALESCE(SUM(wtd.points), 0)::int as total'))
      .first()

    const spent = await knex('coupon_transactions as ct')
      .join('neighbors as n', 'ct.neighbor_id', 'n.id')
      .where('n.entity_id', entityId)
      // El costo se descuenta al adquirir el cupón, no al presentarlo: un cupón
      // sin usar ya consumió los puntos del vecino.
      .whereIn('ct.status', [ACQUIRED, USED, EXPIRED])
      .select(knex.raw('COALESCE(SUM(ct.cost_in_points), 0)::int as total'))
      .first()

    // `outstanding` sale del saldo real de cada vecino, no de restar los dos
    // totales: si algún ajuste manual tocó los puntos, este es el número que
    // los vecinos pueden gastar de verdad.
    const balance = await knex('neighbors')
      .where('entity_id', entityId)
      .where('is_active', true)
      .select(
        knex.raw('COALESCE(SUM(points), 0)::int as total'),
        knex.raw('COUNT(*) FILTER (WHERE points > 0)::int as "withBalance"')
      )
      .first()

    return {
      granted: Number(granted?.total ?? 0),
      spent: Number(spent?.total ?? 0),
      outstanding: Number(balance?.total ?? 0),
      neighborsWithBalance: Number(balance?.withBalance ?? 0)
    }
  }

  async getCo2Avoided(entityId: string, from?: Date, to?: Date): Promise<Co2Avoided> {
    const knex = this.getKnex()

    // El factor CO2 vive en la categoría (kg de CO2 evitados por kg reciclado),
    // así que el cálculo se hace en SQL y no en el front: si mañana cambia el
    // factor, el número sale bien sin tocar el cliente.
    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .join('wastes as w', 'wtd.waste_id', 'w.id')
      .join('waste_categories as wc', 'w.category_id', 'wc.id')
      .where('gp.entity_id', entityId)
      .groupBy('wc.name')
      .orderByRaw('SUM(wtd.weight * wc.co2) DESC')
      .select(
        'wc.name as categoryName',
        knex.raw('COALESCE(SUM(wtd.weight), 0)::float as "totalWeight"'),
        knex.raw('COALESCE(SUM(wtd.weight * wc.co2), 0)::float as "co2"')
      )

    if (from != null) query.where('wt.date', '>=', from)
    if (to != null) query.where('wt.date', '<=', to)

    const rows = (await query) as Array<{ categoryName: string; totalWeight: number; co2: number }>
    const byCategory = rows.map(r => ({
      categoryName: r.categoryName,
      totalWeight: r.totalWeight,
      co2: r.co2
    }))

    return {
      totalCo2: byCategory.reduce((sum, c) => sum + c.co2, 0),
      byCategory
    }
  }

  async getRewardPartnersRanking(
    entityId: string,
    from?: Date,
    to?: Date,
    limit?: number
  ): Promise<RewardPartnerRanking[]> {
    const knex = this.getKnex()

    // Mismo criterio de fecha que usa el dashboard del propio local: la fecha
    // de referencia es redeem_date, y si el cupón todavía no se presentó,
    // adquisition_date (o created_at como último recurso).
    const DATE_REF = 'COALESCE(ct.redeem_date, ct.adquisition_date, ct.created_at)'

    // El rango va en el ON y no en el WHERE: en un LEFT JOIN, filtrar por fecha
    // afuera descartaría las filas NULL y haría desaparecer a los locales sin
    // canjes en el período — justo los que la entidad necesita ver.
    const query = knex('reward_partner_entity as rp')
      .leftJoin('coupon_transactions as ct', function () {
        this.on('ct.reward_partner_id', '=', 'rp.id')
        if (from != null) this.andOn(knex.raw(`${DATE_REF} >= ?`, [from]))
        if (to != null) this.andOn(knex.raw(`${DATE_REF} <= ?`, [to]))
      })
      .where('rp.entity_id', entityId)
      .andWhere('rp.is_active', true)
      .groupBy('rp.id', 'rp.name')
      .orderByRaw('COUNT(*) FILTER (WHERE ct.status = ?) DESC, rp.name ASC', [USED])
      .select(
        'rp.id as rewardPartnerId',
        'rp.name as name',
        knex.raw('COUNT(*) FILTER (WHERE ct.status = ?)::int as "used"', [USED]),
        knex.raw('COUNT(*) FILTER (WHERE ct.status = ?)::int as "acquired"', [ACQUIRED]),
        knex.raw('COUNT(*) FILTER (WHERE ct.status = ?)::int as "expired"', [EXPIRED]),
        knex.raw('COALESCE(SUM(ct.cost_in_points) FILTER (WHERE ct.status = ?), 0)::int as "pointsSpent"', [USED])
      )

    if (limit != null && Number.isInteger(limit) && limit > 0) query.limit(limit)

    const rows = await query
    return rows.map((r: any) => ({
      rewardPartnerId: r.rewardPartnerId,
      name: r.name,
      used: r.used,
      acquired: r.acquired,
      expired: r.expired,
      pointsSpent: r.pointsSpent
    }))
  }

  async getGreenPointsRanking(entityId: string, from?: Date, to?: Date, limit?: number): Promise<GreenPointRanking[]> {
    const knex = this.getKnex()

    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .where('gp.entity_id', entityId)
      .groupBy('gp.id', 'gp.name')
      .orderByRaw('SUM(wtd.weight) DESC')
      .select(
        'gp.id as greenPointId',
        'gp.name as name',
        knex.raw('COALESCE(SUM(wtd.weight), 0)::float as "totalWeight"')
      )

    if (from != null) query.where('wt.date', '>=', from)
    if (to != null) query.where('wt.date', '<=', to)
    // El limit se aplica después del ORDER BY, así que recorta la cola del ranking.
    if (limit != null && Number.isInteger(limit) && limit > 0) query.limit(limit)

    const rows = await query
    return rows.map((r: any) => ({
      greenPointId: r.greenPointId,
      name: r.name,
      totalWeight: r.totalWeight
    }))
  }

  async getWasteByCategory(entityId: string, from?: Date, to?: Date): Promise<WasteByCategory[]> {
    const knex = this.getKnex()

    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .join('wastes as w', 'wtd.waste_id', 'w.id')
      .join('waste_categories as wc', 'w.category_id', 'wc.id')
      .where('gp.entity_id', entityId)
      .groupBy('wc.name')
      .orderByRaw('SUM(wtd.weight) DESC')
      .select('wc.name as categoryName', knex.raw('COALESCE(SUM(wtd.weight), 0)::float as "totalWeight"'))

    if (from != null) query.where('wt.date', '>=', from)
    if (to != null) query.where('wt.date', '<=', to)

    const rows = await query
    return rows.map((r: any) => ({
      categoryName: r.categoryName,
      totalWeight: r.totalWeight
    }))
  }

  async getWasteByPeriod(entityId: string, groupBy: string, from?: Date, to?: Date): Promise<WasteByPeriod[]> {
    const knex = this.getKnex()

    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .where('gp.entity_id', entityId)
      .groupByRaw(`DATE_TRUNC('${groupBy}', wt.date)`)
      .orderByRaw(`DATE_TRUNC('${groupBy}', wt.date) ASC`)
      .select(
        knex.raw(`DATE_TRUNC('${groupBy}', wt.date)::text as "period"`),
        knex.raw('COALESCE(SUM(wtd.weight), 0)::float as "totalWeight"')
      )

    if (from != null) query.where('wt.date', '>=', from)
    if (to != null) query.where('wt.date', '<=', to)

    const rows = await query
    return rows.map((r: any) => ({
      period: r.period,
      totalWeight: r.totalWeight
    }))
  }

  async getNeighborDeliveries(neighborId: string, from?: Date, to?: Date): Promise<NeighborDelivery[]> {
    const knex = this.getKnex()

    const txQuery = knex('wastes_transactions as wt')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .where('wt.neighbor_id', neighborId)
      .orderBy('wt.date', 'desc')
      .select(
        'wt.id as transactionId',
        'wt.date as date',
        'gp.name as greenPointName',
        'wt.total_points as totalPoints'
      )

    if (from != null) txQuery.where('wt.date', '>=', from)
    if (to != null) txQuery.where('wt.date', '<=', to)

    const transactions = await txQuery

    if (transactions.length === 0) return []

    const transactionIds = transactions.map((t: any) => t.transactionId)

    const details = await knex('wastes_transactions_details as wtd')
      .join('wastes as w', 'wtd.waste_id', 'w.id')
      .join('waste_categories as wc', 'w.category_id', 'wc.id')
      .whereIn('wtd.transaction_id', transactionIds)
      .select(
        'wtd.transaction_id as transactionId',
        'wc.name as categoryName',
        knex.raw('wtd.weight::float as weight'),
        'wtd.points as points'
      )

    const detailsMap = new Map<string, Array<{ categoryName: string; weight: number; points: number }>>()
    for (const d of details as Array<{ transactionId: string; categoryName: string; weight: number; points: number }>) {
      const list = detailsMap.get(d.transactionId) ?? []
      list.push({ categoryName: d.categoryName, weight: d.weight, points: d.points })
      detailsMap.set(d.transactionId, list)
    }

    return (
      transactions as Array<{ transactionId: string; date: string; greenPointName: string; totalPoints: number }>
    ).map(t => ({
      transactionId: t.transactionId,
      date: t.date,
      greenPointName: t.greenPointName,
      totalPoints: t.totalPoints,
      details: detailsMap.get(t.transactionId) ?? []
    }))
  }

  async getNeighborRankingByGreenPoint(greenPointId: string, from?: Date, to?: Date): Promise<NeighborRanking[]> {
    const knex = this.getKnex()

    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('neighbors as n', 'wt.neighbor_id', 'n.id')
      .where('wt.green_point_id', greenPointId)
      .groupBy('n.id', 'n.firstname', 'n.lastname')
      .orderByRaw('SUM(wtd.weight) DESC')
      .limit(10)
      .select(
        'n.id as neighborId',
        'n.firstname as firstname',
        'n.lastname as lastname',
        knex.raw('COALESCE(SUM(wtd.weight), 0)::float as "totalWeight"'),
        knex.raw('COALESCE(SUM(wtd.points), 0)::int as "totalPoints"')
      )

    if (from != null) query.where('wt.date', '>=', from)
    if (to != null) query.where('wt.date', '<=', to)

    const rows = await query
    return rows.map((r: any) => ({
      neighborId: r.neighborId,
      firstname: r.firstname,
      lastname: r.lastname,
      totalWeight: r.totalWeight,
      totalPoints: r.totalPoints
    }))
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

export default StatisticsMikroORMRepository
