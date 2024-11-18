import type FindNeighborByIDUseCase from '../../../neighbor/aplication/usecases/find-by-id.usecase'
import type RegisterWasteTransactionDetailUseCase from '../../../waste-transaction-detail/application/usecases/register.usecase'
import type RegisterWasteUseCase from '../../../waste/application/usecases/register.usecase'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type RegisterWasteTransactionUseCase from './register.usecase'
import type UpdateWasteTransactionUseCase from './update.usecase'

class RegisterWasteDeliveryUseCase {
  constructor(
    private readonly registerTransaction: RegisterWasteTransactionUseCase,
    private readonly updateTransaction: UpdateWasteTransactionUseCase,
    private readonly registerTransactionDetail: RegisterWasteTransactionDetailUseCase,
    private readonly registerWaste: RegisterWasteUseCase,
    private readonly findNeighborByID: FindNeighborByIDUseCase
  ) {}

  async exec(payload: WasteDeliveryPayload): Promise<void> {
    const transaction = await this.registerTransaction.exec(payload)
    const { wastes, neighborId } = payload

    const neighbor = await this.findNeighborByID.exec(neighborId)

    for (const waste of wastes) {
      const newWaste = await this.registerWaste.exec(waste)

      const transactionDetail = await this.registerTransactionDetail.exec({
        wasteId: newWaste.id,
        transactionId: transaction.id
      })

      const points = newWaste.calculatePoints()
      transactionDetail.points = points
      transactionDetail.pointsPerWeight = newWaste.pointsPerWeight
      transactionDetail.weight = newWaste.weight

      neighbor.addPoints(points)
      neighbor.registerWaste(newWaste)

      transaction.addTransactionDetail(transactionDetail)
    }

    transaction.calculateTotalPoints()
    await this.updateTransaction.exec(transaction.id, transaction)
  }
}

export default RegisterWasteDeliveryUseCase
