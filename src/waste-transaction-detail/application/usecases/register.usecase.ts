import ErrorWasteTransactionNotFound from '../../../waste-transaction/domain/errors/waste-transaction-not-found.error'
import WasteTransactionDetailEntity from '../../domain/entities/waste-transaction-detail.entity'
import ErrorCannotSaveWasteTransactionDetail from '../../domain/errors/cannot-save-waste-transaction-detail.error'
import type WasteTransactionDetailPayload from '../../domain/payloads/waste-transaction-detail.payload'
import type WasteTransactionDetailRepository from '../../domain/repositories/waste-transaction-detail.repository'

class RegisterWasteTransactionDetailUseCase {
  constructor(private readonly repository: WasteTransactionDetailRepository) {}

  async exec(paylaod: WasteTransactionDetailPayload): Promise<WasteTransactionDetailEntity> {
    const newTransactionDetail = new WasteTransactionDetailEntity(paylaod)

    const idTransaction: string = paylaod.transaction as unknown as string
    const transaction = await this.repository.findWasteTransaction({ id: idTransaction })
    if (transaction == null) {
      throw new ErrorWasteTransactionNotFound()
    }

    const transactionDetail = await this.repository.save(newTransactionDetail)
    if (transactionDetail == null) {
      throw new ErrorCannotSaveWasteTransactionDetail()
    }

    return transactionDetail
  }
}

export default RegisterWasteTransactionDetailUseCase
