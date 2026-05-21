/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const GREEN_POINT_SEEDS = [
  {
    name: 'Punto Verde Etruria Centro',
    email: 'centro@etruria.gob.ar',
    phoneNumber: '3533-400002',
    description:
      'Punto verde principal de Etruria, ubicado en el centro municipal. Acepta plástico, papel, vidrio, metal y orgánico.',
    address: 'Av. San Martín 200, Etruria',
    coordinates: { latitude: -32.9469, longitude: -63.2536 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedGreenPoints(em: EntityManager, entities: EntityEntity[]): Promise<GreenPointEntity[]> {
  const existingGreenPoints = await em.find(GreenPointEntity, {})
  const existingEmails = new Set(existingGreenPoints.map(g => g.email))
  const entityMap = new Map(entities.map(e => [e.email, e]))

  const toCreate = GREEN_POINT_SEEDS.filter(s => !existingEmails.has(s.email))

  if (toCreate.length === 0) {
    console.log('[Seeder] GreenPoint: todos los registros ya existen, se omite.')
    return existingGreenPoints
  }

  const greenPoints = toCreate.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new GreenPointEntity(data, entity)
  })

  await em.persistAndFlush(greenPoints)
  console.log(
    `[Seeder] GreenPoint: ${greenPoints.length} puntos verdes creados, ${existingGreenPoints.length} ya existían.`
  )
  return [...existingGreenPoints, ...greenPoints]
}

export default seedGreenPoints
