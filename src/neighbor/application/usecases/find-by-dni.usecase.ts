import type NeighborEntity from '../../domain/entities/neighbor.entity'
import ErrorNeighborNotFound from '../../domain/errors/neighbor-not-found.error'
import type NeighborRepository from '../../domain/repositories/neighbor.repository'

class FindNeighborByDNIUseCase {
  constructor(private readonly repository: NeighborRepository) {}

  async exec(dni: string): Promise<NeighborEntity> {
    // FIX: dni llega como string desde la URL pero está guardado como number en la BD
    const dniAsNumber = parseInt(dni, 10)

    if (isNaN(dniAsNumber)) {
      throw new ErrorNeighborNotFound(undefined, undefined, undefined, dni)
    }

    const neighbor = await this.repository.find({ dni: dniAsNumber as any })
    if (neighbor == null) {
      throw new ErrorNeighborNotFound(undefined, undefined, undefined, dni)
    }

    return neighbor
  }
}

export default FindNeighborByDNIUseCase
