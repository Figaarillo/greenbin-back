/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'

export const WASTE_CATEGORY_SEEDS = [
  {
    name: 'Plástico',
    pointsPerWeight: 10,
    description: 'Botellas PET, envases, bolsas y todo tipo de plástico reciclable.',
    co2: 2.5
  },
  {
    name: 'Papel y Cartón',
    pointsPerWeight: 8,
    description: 'Diarios, revistas, cajas de cartón y papel de oficina limpio.',
    co2: 1.8
  },
  {
    name: 'Vidrio',
    pointsPerWeight: 6,
    description: 'Botellas, frascos y vidrio plano. No se acepta vidrio templado.',
    co2: 1.2
  },
  {
    name: 'Metal',
    pointsPerWeight: 15,
    description: 'Latas de aluminio, acero, tapas y utensilios metálicos.',
    co2: 3.8
  },
  {
    name: 'Electrónico',
    pointsPerWeight: 25,
    description: 'Celulares, computadoras, electrodomésticos y cables en desuso.',
    co2: 6.0
  },
  {
    name: 'Orgánico',
    pointsPerWeight: 4,
    description: 'Residuos de cocina, restos de frutas, verduras y poda.',
    co2: 0.9
  },
  {
    name: 'Textiles',
    pointsPerWeight: 12,
    description: 'Ropa, telas, calzado y accesorios textiles en desuso.',
    co2: 3.0
  },
  {
    name: 'Escombros y Construcción',
    pointsPerWeight: 3,
    description: 'Restos de demolición, cerámicos, ladrillos y materiales de obra limpia.',
    co2: 0.7
  },
  {
    name: 'Madera',
    pointsPerWeight: 5,
    description: 'Restos de madera limpia, pallets y muebles sin barniz tóxico.',
    co2: 1.0
  },
  {
    name: 'Aceites y Lubricantes',
    pointsPerWeight: 20,
    description: 'Aceite de cocina usado, lubricantes vehiculares y aceites industriales.',
    co2: 5.0
  },
  {
    name: 'Pilas y Baterías',
    pointsPerWeight: 30,
    description: 'Pilas domésticas, baterías de celulares y acumuladores.',
    co2: 8.0
  }
]

async function seedWasteCategories(em: EntityManager): Promise<WasteCategoryEntity[]> {
  const existing = await em.count(WasteCategoryEntity)
  if (existing > 0) {
    console.log(`[Seeder] WasteCategory: ya existen ${existing} registros, se omite.`)
    return await em.find(WasteCategoryEntity, {})
  }

  const categories = WASTE_CATEGORY_SEEDS.map(data => new WasteCategoryEntity(data))
  await em.persistAndFlush(categories)
  console.log(`[Seeder] WasteCategory: ${categories.length} categorías creadas.`)
  return categories
}

export default seedWasteCategories
