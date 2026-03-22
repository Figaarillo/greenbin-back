import type EntityEntity from '../../domain/entities/entity.entity'
import { type EntityRelationships } from '../../domain/enums/entity.enum'
import ErrorEntityNotFound from '../../domain/errors/entity-not-found.error'
import type EntityRepository from '../../domain/repositories/entity.repository'

class FindEntityWithPopulateUseCase {
  constructor(private readonly repository: EntityRepository) {}

  async exec(id: string, populateWith: EntityRelationships[]): Promise<EntityEntity> {
    const entityFound = await this.repository.find({ id }, populateWith)
    if (entityFound == null) {
      throw new ErrorEntityNotFound(id)
    }

    return entityFound
  }
}

export default FindEntityWithPopulateUseCase
