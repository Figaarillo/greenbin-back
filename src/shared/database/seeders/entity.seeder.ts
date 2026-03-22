/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import EntityEntity from '../../../entity/domain/entities/entity.entity'

export const ENTITY_SEEDS = [
  {
    name: 'Municipalidad de Villa María',
    email: 'reciclado@villamaria.gob.ar',
    description: 'Dirección de Gestión Ambiental de la Municipalidad de Villa María. Programa de reciclaje urbano.',
    password: 'VillaMaria2024!',
    city: 'Villa María',
    province: 'Córdoba',
    coordinates: { latitude: -32.4083, longitude: -63.2433 }
  },
  {
    name: 'Cooperativa EcoVerde',
    email: 'contacto@ecoverde.org.ar',
    description: 'Cooperativa de trabajo dedicada a la recolección diferenciada y reciclaje de residuos en Córdoba.',
    password: 'EcoVerde2024!',
    city: 'Córdoba',
    province: 'Córdoba',
    coordinates: { latitude: -31.4201, longitude: -64.1888 }
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
