/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const RESPONSIBLE_SEEDS = [
  {
    firstname: 'Juliana',
    lastname: 'González',
    username: 'jgonzalez',
    entityId: '',
    email: 'jgonzalez@etruria.gob.ar',
    password: 'Resp2024!',
    dni: 33456789,
    phoneNumber: '3533-400001',
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedResponsibles(em: EntityManager, entities: EntityEntity[]): Promise<ResponsibleEntity[]> {
  const existingResponsibles = await em.find(ResponsibleEntity, {})
  const existingEmails = new Set(existingResponsibles.map(r => r.email))
  const entityMap = new Map(entities.map(e => [e.email, e]))

  const toCreate = RESPONSIBLE_SEEDS.filter(s => !existingEmails.has(s.email))

  if (toCreate.length === 0) {
    console.log('[Seeder] Responsible: todos los registros ya existen, se omite.')
    return existingResponsibles
  }

  const responsibles = toCreate.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new ResponsibleEntity(data, entity)
  })

  await em.persistAndFlush(responsibles)
  console.log(
    `[Seeder] Responsible: ${responsibles.length} responsables creados, ${existingResponsibles.length} ya existían.`
  )
  return [...existingResponsibles, ...responsibles]
}

export default seedResponsibles
