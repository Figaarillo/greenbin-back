import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class ListWasteTransactionsByNeighborUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(neighborId: string): Promise<WasteTransactionEntity[]> {
    return await this.repository.findByNeighbor(neighborId)
  }
}

export default ListWasteTransactionsByNeighborUseCase
