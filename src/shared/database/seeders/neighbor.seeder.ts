/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const NEIGHBOR_SEEDS = [
  {
    firstname: 'Carlos',
    lastname: 'Gómez',
    username: 'cgomez',
    email: 'cgomez@gmail.com',
    password: 'Vecino2024!',
    dni: 30123456,
    phoneNumber: '353-5000001',
    birthdate: new Date('1990-05-14'),
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    firstname: 'Ana',
    lastname: 'Martínez',
    username: 'amartinez',
    email: 'amartinez@hotmail.com',
    password: 'Vecino2024!',
    dni: 32876543,
    phoneNumber: '353-5000002',
    birthdate: new Date('1985-11-23'),
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    firstname: 'Diego',
    lastname: 'Sánchez',
    username: 'dsanchez',
    email: 'dsanchez@yahoo.com.ar',
    password: 'Vecino2024!',
    dni: 36543210,
    phoneNumber: '353-5000003',
    birthdate: new Date('1998-03-08'),
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    firstname: 'Valentina',
    lastname: 'Torres',
    username: 'vtorres',
    email: 'vtorres@gmail.com',
    password: 'Vecino2024!',
    dni: 40123789,
    phoneNumber: '353-5000004',
    birthdate: new Date('2001-07-19'),
    entityEmail: 'reciclado@villamaria.gob.ar'
  },
  {
    firstname: 'Pablo',
    lastname: 'Herrera',
    username: 'pherrera',
    email: 'pherrera@gmail.com',
    password: 'Vecino2024!',
    dni: 29876123,
    phoneNumber: '351-5100001',
    birthdate: new Date('1988-12-01'),
    entityEmail: 'contacto@ecoverde.org.ar'
  },
  {
    firstname: 'Lucía',
    lastname: 'Flores',
    username: 'lflores',
    email: 'lflores@outlook.com',
    password: 'Vecino2024!',
    dni: 38901234,
    phoneNumber: '351-5100002',
    birthdate: new Date('2000-09-27'),
    entityEmail: 'contacto@ecoverde.org.ar'
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
