import { MikroORM, type EntityManager, type EntityRepository, type Options } from '@mikro-orm/postgresql'
import EntityEntity from './entity/domain/entities/entity.entity'
import ResponsibleEntity from './responsible/domain/entities/responsible.entity'

export interface Services {
  orm: MikroORM
  em: EntityManager
  entity: EntityRepository<EntityEntity>
  responsible: EntityRepository<ResponsibleEntity>
}

let cache: Services

async function initMikroORM(options?: Options): Promise<Services> {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!cache) {
    const orm = await MikroORM.init(options)

    cache = {
      orm,
      em: orm.em,
      entity: orm.em.getRepository(EntityEntity),
      responsible: orm.em.getRepository(ResponsibleEntity)
    }
  }

  return cache
}

export default initMikroORM
