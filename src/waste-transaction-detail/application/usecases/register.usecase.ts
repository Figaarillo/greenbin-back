import type FindWasteTransactionByIDUseCase from '../../../waste-transaction/application/usecases/find-by-id.usecase'
import type FindWasteByIDUseCase from '../../../waste/application/usecases/find-by-id.usecase'
import WasteTransactionDetailEntity from '../../domain/entities/waste-transaction-detail.entity'
import ErrorCannotSaveWasteTransactionDetail from '../../domain/errors/cannot-save-waste-transaction-detail.error'
import type WasteTransactionDetailPayload from '../../domain/payloads/waste-transaction-detail.payload'
import type WasteTransactionDetailRepository from '../../domain/repositories/waste-transaction-detail.repository'

class RegisterWasteTransactionDetailUseCase {
  constructor(
    private readonly repository: WasteTransactionDetailRepository,
    private readonly findTransactionByID: FindWasteTransactionByIDUseCase,
    private readonly findWasteById: FindWasteByIDUseCase
  ) {}

  async exec(paylaod: WasteTransactionDetailPayload): Promise<WasteTransactionDetailEntity> {
    const transaction = await this.findTransactionByID.exec(paylaod.transactionId)
    const waste = await this.findWasteById.exec(paylaod.wasteId)

    const newTransactionDetail = new WasteTransactionDetailEntity(waste, transaction)

    const transactionDetail = await this.repository.save(newTransactionDetail)
    if (transactionDetail == null) {
      throw new ErrorCannotSaveWasteTransactionDetail()
    }

    return transactionDetail
  }
}

export default RegisterWasteTransactionDetailUseCase
