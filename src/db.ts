import EntityEntity from '@entity/domain/entities/entity.entity'
import { MikroORM, type EntityRepository, type Options, type EntityManager } from '@mikro-orm/postgresql'

export interface Services {
  orm: MikroORM
  em: EntityManager
  entity: EntityRepository<EntityEntity>
}

let cache: Services

async function initMikroORM(options?: Options): Promise<Services> {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!cache) {
    const orm = await MikroORM.init({
      ...options
    })
    cache = {
      orm,
      em: orm.em,
      entity: orm.em.getRepository(EntityEntity)
    }
  }

  return cache
}

export default initMikroORM
