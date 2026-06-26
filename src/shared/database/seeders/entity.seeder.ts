/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import EntityEntity from '../../../entity/domain/entities/entity.entity'

export const ENTITY_SEEDS = [
  {
    name: 'Municipalidad Etruria',
    email: 'muniEtruria@gmail.com',
    description: 'Descripcion',
    password: 'Etruria2024!',
    city: 'Etruria',
    province: 'Cordoba',
    coordinates: { latitude: -32.9380556, longitude: -63.2416667 }
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
