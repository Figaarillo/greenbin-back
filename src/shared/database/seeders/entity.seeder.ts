/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import EntityEntity from '../../../entity/domain/entities/entity.entity'

export const ENTITY_SEEDS = [
  {
    name: 'Municipalidad de Etruria',
    email: 'muniEtruria@gmail.com',
    description:
      'Dirección de Medio Ambiente de la Municipalidad de Etruria. Programa municipal de reciclaje y separación en origen.',
    password: 'Etruria2024!',
    city: 'Etruria',
    province: 'Córdoba',
    coordinates: { latitude: -32.9469, longitude: -63.2536 }
  }
]

async function seedEntities(em: EntityManager): Promise<EntityEntity[]> {
  const existing = await em.count(EntityEntity)
  if (existing > 0) {
    console.log(`[Seeder] Entity: ya existen ${existing} registros, se omite.`)
    return await em.find(EntityEntity, {})
  }

  const entities = ENTITY_SEEDS.map(data => new EntityEntity(data))
  await em.persistAndFlush(entities)
  console.log(`[Seeder] Entity: ${entities.length} entidades creadas.`)
  return entities
}

export default seedEntities
