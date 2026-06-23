/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const GREEN_POINT_SEEDS = [
  {
    name: 'Punto Verde Plaza San Martín',
    email: 'plaza.sanmartin@muni-etruria.gob.ar',
    phoneNumber: '3465-400001',
    description: 'Punto de reciclaje en la plaza principal de Etruria. Acepta plástico, papel, vidrio y metal.',
    address: 'Plaza San Martín s/n, Etruria',
    coordinates: { latitude: -32.9328, longitude: -62.5841 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Punto Verde Escuela Municipal',
    email: 'escuela@muni-etruria.gob.ar',
    phoneNumber: '3465-400002',
    description: 'Punto verde frente a la escuela municipal. Especial para papel, cartón y pilas.',
    address: 'Calle Belgrano 450, Etruria',
    coordinates: { latitude: -32.9315, longitude: -62.582 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Punto Verde Barrio Los Olivos',
    email: 'losolivos@muni-etruria.gob.ar',
    phoneNumber: '3465-400003',
    description: 'Centro de acopio en el barrio Los Olivos. Acepta textiles, vidrio y metales.',
    address: 'Av. Los Olivos 120, Etruria',
    coordinates: { latitude: -32.935, longitude: -62.581 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Punto Verde Acceso Norte',
    email: 'acceso.norte@muni-etruria.gob.ar',
    phoneNumber: '3465-400004',
    description: 'Punto de acopio en el acceso norte. Recibe escombros, madera y residuos voluminosos.',
    address: 'Ruta Provincial 6, Acceso Norte, Etruria',
    coordinates: { latitude: -32.929, longitude: -62.5855 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Instituto Secundario General Paz',
    email: 'isgp@mail.com',
    phoneNumber: '3535001122',
    description:
      'Lunes\n7 a.m.–6:45 p.m.\n\nMartes\n7 a.m.–6:45 p.m.\n\nMiércoles\n7 a.m.–6:45 p.m.\n\nJueves\n7 a.m.–6:45 p.m.\n\nViernes\n7 a.m.–6:45 p.m.\n',
    address: '135 Blvd. Sarmiento, etruria',
    coordinates: { latitude: -32.9400424, longitude: -63.2451804 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'casa licha',
    email: 'casalicha@mail.com',
    phoneNumber: '3535647071',
    description: 'todos los dias, todas las horaa',
    address: 'catamarca 1346',
    coordinates: { latitude: -32.93940383687256, longitude: -63.24391657697561 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
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
