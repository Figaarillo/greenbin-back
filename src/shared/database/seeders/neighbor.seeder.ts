/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const NEIGHBOR_SEEDS = [
  {
    firstname: 'Martina',
    lastname: 'Álvarez',
    username: 'malvarez_et',
    email: 'malvarez.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100001,
    phoneNumber: '3465-500001',
    birthdate: new Date('1995-03-12'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Joaquín',
    lastname: 'Pérez',
    username: 'jperez_et',
    email: 'jperez.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100002,
    phoneNumber: '3465-500002',
    birthdate: new Date('1999-08-25'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Romina',
    lastname: 'Castro',
    username: 'rcastro_et',
    email: 'rcastro.etruria@hotmail.com',
    password: 'Vecino2024!',
    dni: 44100003,
    phoneNumber: '3465-500003',
    birthdate: new Date('1993-11-17'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Nicolás',
    lastname: 'Giménez',
    username: 'ngimenez_et',
    email: 'ngimenez.etruria@yahoo.com.ar',
    password: 'Vecino2024!',
    dni: 44100004,
    phoneNumber: '3465-500004',
    birthdate: new Date('2003-04-30'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Florencia',
    lastname: 'Ríos',
    username: 'frios_et',
    email: 'frios.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100005,
    phoneNumber: '3465-500005',
    birthdate: new Date('1997-06-14'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Agustín',
    lastname: 'Moreno',
    username: 'amoreno_et',
    email: 'amoreno.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100006,
    phoneNumber: '3465-500006',
    birthdate: new Date('1991-09-03'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Camila',
    lastname: 'Vargas',
    username: 'cvargas_et',
    email: 'cvargas.etruria@outlook.com',
    password: 'Vecino2024!',
    dni: 44100007,
    phoneNumber: '3465-500007',
    birthdate: new Date('2004-01-22'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Rodrigo',
    lastname: 'Acosta',
    username: 'racosta_et',
    email: 'racosta.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100008,
    phoneNumber: '3465-500008',
    birthdate: new Date('1987-12-11'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Luciana',
    lastname: 'Benítez',
    username: 'lbenitez_et',
    email: 'lbenitez.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100009,
    phoneNumber: '3465-500009',
    birthdate: new Date('2001-07-08'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Tomás',
    lastname: 'Ibáñez',
    username: 'tibanez_et',
    email: 'tibanez.etruria@hotmail.com',
    password: 'Vecino2024!',
    dni: 44100010,
    phoneNumber: '3465-500010',
    birthdate: new Date('1992-05-19'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Sabrina',
    lastname: 'Romero',
    username: 'sromero_et',
    email: 'sromero.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100011,
    phoneNumber: '3465-500011',
    birthdate: new Date('1996-10-27'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Ezequiel',
    lastname: 'Navarro',
    username: 'enavarro_et',
    email: 'enavarro.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100012,
    phoneNumber: '3465-500012',
    birthdate: new Date('2005-02-14'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Valeria',
    lastname: 'Pereyra',
    username: 'vpereyra_et',
    email: 'vpereyra.etruria@yahoo.com.ar',
    password: 'Vecino2024!',
    dni: 44100013,
    phoneNumber: '3465-500013',
    birthdate: new Date('1989-08-06'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Hernán',
    lastname: 'Quispe',
    username: 'hquispe_et',
    email: 'hquispe.etruria@gmail.com',
    password: 'Vecino2024!',
    dni: 44100014,
    phoneNumber: '3465-500014',
    birthdate: new Date('1994-03-25'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Daniela',
    lastname: 'Fuentes',
    username: 'dfuentes_et',
    email: 'dfuentes.etruria@outlook.com',
    password: 'Vecino2024!',
    dni: 44100015,
    phoneNumber: '3465-500015',
    birthdate: new Date('2000-11-30'),
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    firstname: 'Enzo',
    lastname: 'Mattalia',
    username: 'emattalia',
    email: 'enzomattalia@hotmail.com',
    password: 'Vecino2024!',
    dni: 41234567,
    phoneNumber: '3533-500001',
    birthdate: new Date('1995-04-22'),
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedNeighbors(em: EntityManager, entities: EntityEntity[]): Promise<NeighborEntity[]> {
  const existing = await em.count(NeighborEntity)
  if (existing > 0) {
    console.log(`[Seeder] Neighbor: ya existen ${existing} registros, se omite.`)
    return await em.find(NeighborEntity, {})
  }

  const entityMap = new Map(entities.map(e => [e.email, e]))

  const neighbors = NEIGHBOR_SEEDS.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new NeighborEntity(
      data.firstname,
      data.lastname,
      data.username,
      data.email,
      data.password,
      data.dni,
      data.phoneNumber,
      data.birthdate,
      entity
    )
  })

  await em.persistAndFlush(neighbors)
  console.log(`[Seeder] Neighbor: ${neighbors.length} vecinos creados.`)
  return neighbors
}

export default seedNeighbors
