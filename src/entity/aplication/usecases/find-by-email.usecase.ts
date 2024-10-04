import type EntityEntity from '../../domain/entities/entity.entity'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../domain/repositories/entity.repository'

class FindByEmailUseCase {
  constructor(private readonly repository: EntityRepository) {}

  async exec(email: string): Promise<EntityEntity> {
    const entity = await this.repository.find({ email })
    if (entity == null) throw new ErrorEntityNotFound(undefined, undefined, email)
    return entity
  }
}

export default FindByEmailUseCase
