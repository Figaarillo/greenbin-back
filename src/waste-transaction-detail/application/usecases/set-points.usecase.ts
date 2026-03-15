import type WasteTransactionDetailEntity from '../../domain/entities/waste-transaction-detail.entity'

class SetOnePointsUseCase {
  exec(wasteTransactionDetail: WasteTransactionDetailEntity): void {
    wasteTransactionDetail.setPoints()
  }
}

export default SetOnePointsUseCase
