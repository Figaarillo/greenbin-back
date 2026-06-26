/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import { Roles } from '../../../auth/domain/entities/role'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const RESPONSIBLE_SEEDS = [
  {
    firstname: 'Roberto',
    lastname: 'Páez',
    username: 'rpaez_etruria',
    email: 'rpaez@muni-etruria.gob.ar',
    password: 'Resp2024!',
    dni: 27654321,
    phoneNumber: '3465-410001',
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Gabriela',
    lastname: 'Suárez',
    username: 'gsuarez_etruria',
    email: 'gsuarez@muni-etruria.gob.ar',
    password: 'Resp2024!',
    dni: 33456789,
    phoneNumber: '3465-410002',
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Fernando',
    lastname: 'Méndez',
    username: 'fmendez_etruria',
    email: 'fmendez@muni-etruria.gob.ar',
    password: 'Resp2024!',
    dni: 30987654,
    phoneNumber: '3465-410003',
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Juliana',
    lastname: 'González',
    username: 'jgonzalez',
    email: 'jgonzalez@etruria.gob.ar',
    password: 'Resp2024!',
    dni: 33456789,
    phoneNumber: '3533-400001',
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedResponsibles(em: EntityManager, entities: EntityEntity[]): Promise<ResponsibleEntity[]> {
  const existing = await em.count(ResponsibleEntity, { role: Roles.RESPONSIBLE })
  if (existing > 0) {
    console.log(`[Seeder] Responsible: ya existen ${existing} registros, se omite.`)
    return await em.find(ResponsibleEntity, { role: Roles.RESPONSIBLE })
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
