import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import ErrorWasteTransactionNotFound from '../../domain/errors/waste-transaction-not-found.error'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class FindByIdWasteTransactionByIDUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(id: string): Promise<WasteTransactionEntity> {
    const wasteTransaction = await this.repository.find({ id })
    if (wasteTransaction == null) {
      throw new ErrorWasteTransactionNotFound(id)
    }

    return wasteTransaction
  }
}

export default FindByIdWasteTransactionByIDUseCase
