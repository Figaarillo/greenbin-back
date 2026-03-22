import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import ErrorWasteTransactionNotFound from '../../domain/errors/waste-transaction-not-found.error'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class UpdateWasteTransactionUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(id: string, payload: WasteTransactionEntity): Promise<WasteTransactionEntity> {
    const transactionUpdated = await this.repository.update(id, payload)
    if (transactionUpdated == null) {
      throw new ErrorWasteTransactionNotFound(id)
    }

    return transactionUpdated
  }
}

export default UpdateWasteTransactionUseCase
