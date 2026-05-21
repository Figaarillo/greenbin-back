/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const NEIGHBOR_SEEDS: Array<{
  firstname: string
  lastname: string
  username: string
  email: string
  password: string
  dni: number
  phoneNumber: string
  birthdate: Date
  entityEmail: string
}> = []

async function seedNeighbors(em: EntityManager, entities: EntityEntity[]): Promise<NeighborEntity[]> {
  const existingNeighbors = await em.find(NeighborEntity, {})
  const existingEmails = new Set(existingNeighbors.map(n => n.email))
  const entityMap = new Map(entities.map(e => [e.email, e]))

  const toCreate = NEIGHBOR_SEEDS.filter(s => !existingEmails.has(s.email))

  if (toCreate.length === 0) {
    console.log('[Seeder] Neighbor: todos los registros ya existen, se omite.')
    return existingNeighbors
  }

  const neighbors = toCreate.map(({ entityEmail, ...data }) => {
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
  console.log(`[Seeder] Neighbor: ${neighbors.length} vecinos creados, ${existingNeighbors.length} ya existían.`)
  return [...existingNeighbors, ...neighbors]
}

export default seedNeighbors
