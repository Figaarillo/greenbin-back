/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import seedWasteCategories from './waste-category.seeder'
import seedEntities from './entity.seeder'
import seedResponsibles from './responsible.seeder'
import seedRewardPartners from './reward-partner.seeder'
import seedNeighbors from './neighbor.seeder'
import seedGreenPoints from './green-point.seeder'
import seedCoupons from './coupon.seeder'
import seedWasteTransactions from './waste-transaction.seeder'
import seedCouponTransactions from './coupon-transaction.seeder'

/**
 * Orquestador principal del seeder.
 * Ejecuta cada seeder en el orden correcto respetando las dependencias entre entidades.
 * Todos los seeders son idempotentes: verifican si ya existen datos antes de insertar.
 */
async function runSeeders(em: EntityManager): Promise<void> {
  console.log('\n🌱 Iniciando seeders de desarrollo...\n')
  const start = Date.now()

  try {
    // 1. Sin dependencias
    const categories = await seedWasteCategories(em.fork())
    const entities = await seedEntities(em.fork())

    // 2. Dependen de Entity
    const responsibles = await seedResponsibles(em.fork(), entities)
    const rewardPartners = await seedRewardPartners(em.fork(), entities)
    const neighbors = await seedNeighbors(em.fork(), entities)
    const greenPoints = await seedGreenPoints(em.fork(), entities)

    // 3. Dependen de RewardPartner
    const coupons = await seedCoupons(em.fork(), rewardPartners)

    // 4. Dependen de Responsible + Neighbor + GreenPoint + Category
    await seedWasteTransactions(em.fork(), responsibles, neighbors, greenPoints, categories)

    // 5. Dependen de Coupon + Neighbor + RewardPartner
    await seedCouponTransactions(em.fork(), coupons, neighbors, rewardPartners)

    const elapsed = ((Date.now() - start) / 1000).toFixed(2)
    console.log(`\n✅ Seeders completados en ${elapsed}s\n`)
  } catch (err) {
    console.error('\n❌ Error durante el seeding:', err)
    throw err
  }
}

export default runSeeders
