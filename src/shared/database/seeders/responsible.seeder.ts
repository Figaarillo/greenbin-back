/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const RESPONSIBLE_SEEDS = [
  {
    firstname: 'Laura',
    lastname: 'Fernández',
    username: 'lfernandez',
    entityId: '',
    email: 'lfernandez@villamaria.gob.ar',
    password: 'Resp2024!',
    dni: 28456789,
    phoneNumber: '353-4100001',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    firstname: 'Martín',
    lastname: 'Rodríguez',
    username: 'mrodriguez',
    entityId: '',
    email: 'mrodriguez@villamaria.gob.ar',
    password: 'Resp2024!',
    dni: 31234567,
    phoneNumber: '353-4100002',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    firstname: 'Sofía',
    lastname: 'López',
    username: 'slopez',
    entityId: '',
    email: 'slopez@ecoverde.org.ar',
    password: 'Resp2024!',
    dni: 35678901,
    phoneNumber: '351-4200001',
    entityEmail: 'contacto@ecoverde.org.ar'
  }
]

async function seedResponsibles(em: EntityManager, entities: EntityEntity[]): Promise<ResponsibleEntity[]> {
  const existing = await em.count(ResponsibleEntity)
  if (existing > 0) {
    console.log(`[Seeder] Responsible: ya existen ${existing} registros, se omite.`)
    return await em.find(ResponsibleEntity, {})
  }

  const entityMap = new Map(entities.map(e => [e.email, e]))

  const responsibles = RESPONSIBLE_SEEDS.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new ResponsibleEntity(data, entity)
  })

  await em.persistAndFlush(responsibles)
  console.log(`[Seeder] Responsible: ${responsibles.length} responsables creados.`)
  return responsibles
}

export default seedResponsibles
