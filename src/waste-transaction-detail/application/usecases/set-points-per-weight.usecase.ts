import type WasteTransactionDetailEntity from '../../domain/entities/waste-transaction-detail.entity'

class SetPerWeightUseCase {
  exec(wasteTransactionDetail: WasteTransactionDetailEntity): void {
    wasteTransactionDetail.setPointsPerWeight()
  }
}

export default SetPerWeightUseCase
