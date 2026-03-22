/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const GREEN_POINT_SEEDS = [
  {
    name: 'Punto Verde Plaza Central',
    email: 'plaza.central@villamaria.gob.ar',
    phoneNumber: '353-4200001',
    description: 'Punto de reciclaje ubicado en la Plaza Central. Acepta plástico, papel, vidrio y metal.',
    address: 'Plaza Centenario s/n, Villa María',
    coordinates: { latitude: -32.4095, longitude: -63.2442 },
    entityId: '',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    name: 'Punto Verde Barrio San Martín',
    email: 'sanmartin@villamaria.gob.ar',
    phoneNumber: '353-4200002',
    description: 'Punto de reciclaje en el barrio San Martín. Amplia capacidad para residuos electrónicos.',
    address: 'Calle Italia 1500, Barrio San Martín, Villa María',
    coordinates: { latitude: -32.419, longitude: -63.251 },
    entityId: '',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    name: 'Punto Verde Universidad Nacional',
    email: 'unvm@ecoverde.org.ar',
    phoneNumber: '353-4200003',
    description: 'Punto verde en el campus universitario de Villa María. Especial para papel y electrónico.',
    address: 'Arturo Jauretche 1555, Villa María',
    coordinates: { latitude: -32.401, longitude: -63.232 },
    entityId: '',
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    name: 'Punto Verde Barrio Nueva Córdoba',
    email: 'nueva.cordoba@ecoverde.org.ar',
    phoneNumber: '351-4300001',
    description: 'Centro de acopio en Nueva Córdoba. Acepta todas las categorías de reciclables.',
    address: 'Av. Hipólito Yrigoyen 500, Nueva Córdoba',
    coordinates: { latitude: -31.43, longitude: -64.192 },
    entityId: '',
    entityEmail: 'contacto@ecoverde.org.ar'
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
