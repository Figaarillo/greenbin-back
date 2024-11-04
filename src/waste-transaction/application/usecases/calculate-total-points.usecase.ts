import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'

class CalculateTotalPointsUseCase {
  constructor(private readonly transaction: WasteTransactionEntity) {}

  exec(): number {
    return this.transaction.calculateTotalPoints()
  }
}

export default CalculateTotalPointsUseCase
