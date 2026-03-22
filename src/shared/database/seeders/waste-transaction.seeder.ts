/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import WasteTransactionEntity from '../../../waste-transaction/domain/entities/waste-transaction.entity'
import WasteTransactionDetailEntity from '../../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'
import WasteEntity from '../../../waste/domain/entities/waste.entity'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'

interface TransactionSeed {
  responsibleUsername: string
  neighborUsername: string
  greenPointName: string
  daysAgo: number
  details: Array<{ categoryName: string; weight: number }>
}

const TRANSACTION_SEEDS: TransactionSeed[] = [
  {
    responsibleUsername: 'lfernandez',
    neighborUsername: 'cgomez',
    greenPointName: 'Punto Verde Plaza Central',
    daysAgo: 1,
    details: [
      { categoryName: 'Plástico', weight: 2.5 },
      { categoryName: 'Papel y Cartón', weight: 1.8 }
    ]
  },
  {
    responsibleUsername: 'lfernandez',
    neighborUsername: 'amartinez',
    greenPointName: 'Punto Verde Plaza Central',
    daysAgo: 2,
    details: [
      { categoryName: 'Vidrio', weight: 3.0 },
      { categoryName: 'Metal', weight: 0.5 }
    ]
  },
  {
    responsibleUsername: 'mrodriguez',
    neighborUsername: 'dsanchez',
    greenPointName: 'Punto Verde Barrio San Martín',
    daysAgo: 3,
    details: [
      { categoryName: 'Electrónico', weight: 1.2 },
      { categoryName: 'Plástico', weight: 1.0 }
    ]
  },
  {
    responsibleUsername: 'mrodriguez',
    neighborUsername: 'vtorres',
    greenPointName: 'Punto Verde Barrio San Martín',
    daysAgo: 5,
    details: [
      { categoryName: 'Papel y Cartón', weight: 4.0 },
      { categoryName: 'Orgánico', weight: 2.0 }
    ]
  },
  {
    responsibleUsername: 'lfernandez',
    neighborUsername: 'cgomez',
    greenPointName: 'Punto Verde Universidad Nacional',
    daysAgo: 7,
    details: [
      { categoryName: 'Plástico', weight: 1.5 },
      { categoryName: 'Metal', weight: 1.0 },
      { categoryName: 'Vidrio', weight: 2.0 }
    ]
  },
  {
    responsibleUsername: 'slopez',
    neighborUsername: 'pherrera',
    greenPointName: 'Punto Verde Barrio Nueva Córdoba',
    daysAgo: 2,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.5 },
      { categoryName: 'Plástico', weight: 2.0 }
    ]
  },
  {
    responsibleUsername: 'slopez',
    neighborUsername: 'lflores',
    greenPointName: 'Punto Verde Barrio Nueva Córdoba',
    daysAgo: 4,
    details: [
      { categoryName: 'Electrónico', weight: 0.8 },
      { categoryName: 'Metal', weight: 1.5 }
    ]
  }
]

function daysAgoDate(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

async function seedWasteTransactions(
  em: EntityManager,
  responsibles: ResponsibleEntity[],
  neighbors: NeighborEntity[],
  greenPoints: GreenPointEntity[],
  categories: WasteCategoryEntity[]
): Promise<void> {
  const existing = await em.count(WasteTransactionEntity)
  if (existing > 0) {
    console.log(`[Seeder] WasteTransaction: ya existen ${existing} registros, se omite.`)
    return
  }

  const responsibleMap = new Map(responsibles.map(r => [r.username, r]))
  const neighborMap = new Map(neighbors.map(n => [n.username, n]))
  const greenPointMap = new Map(greenPoints.map(g => [g.name, g]))
  const categoryMap = new Map(categories.map(c => [c.name, c]))

  for (const seed of TRANSACTION_SEEDS) {
    const responsible = responsibleMap.get(seed.responsibleUsername)
    const neighbor = neighborMap.get(seed.neighborUsername)
    const greenPoint = greenPointMap.get(seed.greenPointName)

    if (responsible == null) throw new Error(`[Seeder] Responsible no encontrado: ${seed.responsibleUsername}`)
    if (neighbor == null) throw new Error(`[Seeder] Neighbor no encontrado: ${seed.neighborUsername}`)
    if (greenPoint == null) throw new Error(`[Seeder] GreenPoint no encontrado: ${seed.greenPointName}`)

    const transaction = new WasteTransactionEntity(responsible, neighbor, greenPoint)
    transaction.date = daysAgoDate(seed.daysAgo)

    for (const detail of seed.details) {
      const category = categoryMap.get(detail.categoryName)
      if (category == null) throw new Error(`[Seeder] Categoría no encontrada: ${detail.categoryName}`)

      const waste = new WasteEntity(category, detail.weight, category.pointsPerWeight)
      waste.calculatePoints()
      em.persist(waste)

      const transactionDetail = new WasteTransactionDetailEntity(waste, transaction)
      transactionDetail.setPointsPerWeight()
      transactionDetail.setPoints()
      em.persist(transactionDetail)

      transaction.addTransactionDetail(transactionDetail)
      neighbor.addPoints(transactionDetail.points)
      neighbor.registerWaste(waste)
    }

    em.persist(transaction)
  }

  await em.flush()
  console.log(`[Seeder] WasteTransaction: ${TRANSACTION_SEEDS.length} transacciones creadas con sus detalles.`)
}

export default seedWasteTransactions
