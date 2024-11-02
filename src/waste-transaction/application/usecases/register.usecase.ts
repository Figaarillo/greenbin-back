import WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import ErrorCannotSaveWasteTransaction from '../../domain/errors/cannot-save-waste-transaction.error'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class RegisterWasteTransactionUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(payload: WasteTransactionPayload): Promise<any> {
    const newTransaction = new WasteTransactionEntity(payload)

    const wasteTransaction = await this.repository.save(newTransaction)
    if (wasteTransaction == null) {
      throw new ErrorCannotSaveWasteTransaction()
    }

    return wasteTransaction
  }
}

export default RegisterWasteTransactionUseCase
