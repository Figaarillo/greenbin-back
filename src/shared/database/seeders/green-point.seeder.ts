/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const GREEN_POINT_SEEDS = [
  {
    name: 'ISGP',
    email: 'isgp@mail.com',
    phoneNumber: '3535001122',
    description:
      'Instituto Secundario General Paz.\n\nLunes a Viernes\n7 a.m.–6:45 p.m.\n\nAcepta plástico, papel, cartón, vidrio y metal.',
    address: '135 Blvd. Sarmiento, Etruria',
    coordinates: { latitude: -32.939808971560716, longitude: -63.245286943769905 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Colegio Malvinas',
    email: 'colegiomalvinas@muni-etruria.gob.ar',
    phoneNumber: '3535002233',
    description:
      'Punto verde en el Colegio Malvinas.\n\nLunes a Viernes\n8 a.m.–5 p.m.\n\nEspecial para papel, cartón, pilas y baterías.',
    address: 'Barrio Malvinas, Etruria',
    coordinates: { latitude: -32.9380329670405, longitude: -63.25262147499036 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedGreenPoints(em: EntityManager, entities: EntityEntity[]): Promise<GreenPointEntity[]> {
  const existing = await em.count(GreenPointEntity)
  if (existing > 0) {
    console.log(`[Seeder] GreenPoint: ya existen ${existing} registros, se omite.`)
    return await em.find(GreenPointEntity, {})
  }

  const entityMap = new Map(entities.map(e => [e.email, e]))

  const greenPoints = GREEN_POINT_SEEDS.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new GreenPointEntity(data, entity)
  })

  await em.persistAndFlush(greenPoints)
  console.log(`[Seeder] GreenPoint: ${greenPoints.length} puntos verdes creados.`)
  return greenPoints
}

export default seedGreenPoints
