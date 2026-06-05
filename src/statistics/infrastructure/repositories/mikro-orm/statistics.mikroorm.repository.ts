import { RequestContext } from '@mikro-orm/core'
import type { EntityManager } from '@mikro-orm/postgresql'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type StatisticsRepository from '../../../domain/repositories/statistics.repository'
import type TotalRecycled from '../../../domain/types/total-recycled.type'
import type GreenPointRanking from '../../../domain/types/green-point-ranking.type'
import type WasteByCategory from '../../../domain/types/waste-by-category.type'
import type WasteByPeriod from '../../../domain/types/waste-by-period.type'
import type NeighborDelivery from '../../../domain/types/neighbor-delivery.type'

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

  async getGreenPointsRanking(entityId: string, from?: Date, to?: Date): Promise<GreenPointRanking[]> {
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
    const validGroupBy = ['day', 'week', 'month', 'year'].includes(groupBy) ? groupBy : 'month'

    const query = knex('wastes_transactions_details as wtd')
      .join('wastes_transactions as wt', 'wtd.transaction_id', 'wt.id')
      .join('green_point_entity as gp', 'wt.green_point_id', 'gp.id')
      .where('gp.entity_id', entityId)
      .groupByRaw(`DATE_TRUNC('${validGroupBy}', wt.date)`)
      .orderByRaw(`DATE_TRUNC('${validGroupBy}', wt.date) ASC`)
      .select(
        knex.raw(`DATE_TRUNC('${validGroupBy}', wt.date)::text as "period"`),
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
