import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'

class CalculateTotalPointsUseCase {
  exec(WasteTransaction: WasteTransactionEntity): void {
    WasteTransaction.caculateTotalPoints()
  }
}

export default CalculateTotalPointsUseCase
