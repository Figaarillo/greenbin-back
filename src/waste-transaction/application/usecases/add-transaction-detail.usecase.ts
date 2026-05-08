import type WasteTransactionDetailEntity from '../../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'
import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'

class CalculateTotalPointsUseCase {
  constructor(private readonly transaction: WasteTransactionEntity) {}

  exec(transactionDetail: WasteTransactionDetailEntity): void {
    this.transaction.addTransactionDetail(transactionDetail)
  }
}

export default CalculateTotalPointsUseCase
