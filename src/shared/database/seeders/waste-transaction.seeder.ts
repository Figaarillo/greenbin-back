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
  neighborUsername?: string
  neighborEmail?: string
  greenPointName: string
  daysAgo: number
  details: Array<{ categoryName: string; weight: number }>
}

const TRANSACTION_SEEDS: TransactionSeed[] = [
  // Transacciones de Enzo Mattalia (Etruria) — últimos 4 meses
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 5,
    details: [
      { categoryName: 'Plástico', weight: 2.0 },
      { categoryName: 'Papel y Cartón', weight: 1.5 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 13,
    details: [
      { categoryName: 'Vidrio', weight: 3.2 },
      { categoryName: 'Metal', weight: 0.8 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 22,
    details: [
      { categoryName: 'Orgánico', weight: 2.5 },
      { categoryName: 'Plástico', weight: 1.2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 35,
    details: [
      { categoryName: 'Papel y Cartón', weight: 4.0 },
      { categoryName: 'Vidrio', weight: 2.0 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 47,
    details: [
      { categoryName: 'Metal', weight: 1.5 },
      { categoryName: 'Plástico', weight: 2.8 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 58,
    details: [{ categoryName: 'Orgánico', weight: 3.0 }]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 70,
    details: [
      { categoryName: 'Plástico', weight: 1.8 },
      { categoryName: 'Vidrio', weight: 2.5 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 82,
    details: [
      { categoryName: 'Papel y Cartón', weight: 3.0 },
      { categoryName: 'Metal', weight: 1.2 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 91,
    details: [
      { categoryName: 'Plástico', weight: 2.2 },
      { categoryName: 'Orgánico', weight: 1.8 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 100,
    details: [
      { categoryName: 'Vidrio', weight: 1.5 },
      { categoryName: 'Papel y Cartón', weight: 2.0 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 110,
    details: [
      { categoryName: 'Metal', weight: 2.0 },
      { categoryName: 'Plástico', weight: 1.0 }
    ]
  },
  {
    responsibleUsername: 'jgonzalez',
    neighborEmail: 'enzomattalia@hotmail.com',
    greenPointName: 'Punto Verde Etruria Centro',
    daysAgo: 118,
    details: [
      { categoryName: 'Orgánico', weight: 2.8 },
      { categoryName: 'Vidrio', weight: 1.0 }
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
  const responsibleMap = new Map(responsibles.map(r => [r.username, r]))
  const neighborByUsernameMap = new Map(neighbors.map(n => [n.username, n]))
  const neighborByEmailMap = new Map(neighbors.map(n => [n.email, n]))
  const greenPointMap = new Map(greenPoints.map(g => [g.name, g]))
  const categoryMap = new Map(categories.map(c => [c.name, c]))

  // Obtener IDs de vecinos que ya tienen transacciones para no duplicar
  const existingTransactions = await em.find(WasteTransactionEntity, {}, { fields: ['neighbor'] })
  const neighborsWithTransactions = new Set(existingTransactions.map(t => t.neighbor.id))

  let created = 0
  let skipped = 0

  for (const seed of TRANSACTION_SEEDS) {
    const responsible = responsibleMap.get(seed.responsibleUsername)
    const neighbor =
      seed.neighborUsername != null
        ? neighborByUsernameMap.get(seed.neighborUsername)
        : neighborByEmailMap.get(seed.neighborEmail ?? '')
    const greenPoint = greenPointMap.get(seed.greenPointName)

    if (responsible == null) throw new Error(`[Seeder] Responsible no encontrado: ${seed.responsibleUsername}`)
    if (neighbor == null)
      throw new Error(`[Seeder] Neighbor no encontrado: ${seed.neighborUsername ?? seed.neighborEmail}`)
    if (greenPoint == null) throw new Error(`[Seeder] GreenPoint no encontrado: ${seed.greenPointName}`)

    if (neighborsWithTransactions.has(neighbor.id)) {
      skipped++
      continue
    }

    const transaction = new WasteTransactionEntity(responsible, neighbor, greenPoint)
    transaction.date = daysAgoDate(seed.daysAgo)

    for (const detail of seed.details) {
      const category = categoryMap.get(detail.categoryName)
      if (category == null) throw new Error(`[Seeder] Categoría no encontrada: ${detail.categoryName}`)

      const waste = new WasteEntity(category, detail.weight, category.pointsPerWeight)
      waste.calculatePoints()
      em.persist(waste)

      const transactionDetail = new WasteTransactionDetailEntity(waste, transaction)
      transactionDetail.weight = waste.weight
      transactionDetail.setPointsPerWeight()
      transactionDetail.setPoints()
      em.persist(transactionDetail)

      transaction.addTransactionDetail(transactionDetail)
      neighbor.addPoints(transactionDetail.points)
      neighbor.registerWaste(waste)
    }

    em.persist(transaction)
    created++
  }

  await em.flush()
  console.log(
    `[Seeder] WasteTransaction: ${created} transacciones creadas, ${skipped} omitidas (vecino ya tenía datos).`
  )
}

export default seedWasteTransactions
