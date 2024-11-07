import type WasteTransactionDetailEntity from '../../domain/entities/waste-transaction-detail.entity'
import ErrorWasteTransactionDetailNotFound from '../../domain/errors/waste-transaction-detail-not-found.error'
import type WasteTransactionDetailRepository from '../../domain/repositories/waste-transaction-detail.repository'

class FindWasteTransactionDetailByIDUseCase {
  constructor(private readonly repository: WasteTransactionDetailRepository) {}

  async exec(id: string): Promise<WasteTransactionDetailEntity> {
    const wasteTransactionDetail = await this.repository.find({ id })
    if (wasteTransactionDetail == null) {
      throw new ErrorWasteTransactionDetailNotFound(id)
    }

    return wasteTransactionDetail
  }
}

export default FindWasteTransactionDetailByIDUseCase
