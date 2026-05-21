import type EmailService from '../../../auth/application/service/email.service'
import type FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import type RegisterWasteTransactionDetailUseCase from '../../../waste-transaction-detail/application/usecases/register.usecase'
import type RegisterWasteUseCase from '../../../waste/application/usecases/register.usecase'
import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type RegisterWasteTransactionUseCase from './register.usecase'
import type UpdateWasteTransactionUseCase from './update.usecase'

class RegisterWasteDeliveryUseCase {
  constructor(
    private readonly registerTransaction: RegisterWasteTransactionUseCase,
    private readonly updateTransaction: UpdateWasteTransactionUseCase,
    private readonly registerTransactionDetail: RegisterWasteTransactionDetailUseCase,
    private readonly registerWaste: RegisterWasteUseCase,
    private readonly findNeighborByID: FindNeighborByIDUseCase,
    private readonly emailService: EmailService
  ) {}

  async exec(payload: WasteDeliveryPayload): Promise<WasteTransactionEntity> {
    const transaction = await this.registerTransaction.exec(payload)
    const { wastes, neighborId } = payload

    const neighbor = await this.findNeighborByID.exec(neighborId)
    const wasteDetails: Array<{ categoryName: string; weight: number }> = []

    for (const waste of wastes) {
      const newWaste = await this.registerWaste.exec(waste)

      const points = newWaste.calculatePoints()

      const transactionDetail = await this.registerTransactionDetail.exec({
        wasteId: newWaste.id,
        transactionId: transaction.id,
        weight: newWaste.weight,
        points,
        pointsPerWeight: newWaste.pointsPerWeight
      })

      neighbor.addPoints(points)
      neighbor.registerWaste(newWaste)

      transaction.addTransactionDetail(transactionDetail)
      wasteDetails.push({ categoryName: newWaste.category.name, weight: newWaste.weight })
    }

    transaction.calculateTotalPoints()
    const updatedTransaction = await this.updateTransaction.exec(transaction.id, transaction)

    await this.emailService.sendWasteDeliveryConfirmation(
      neighbor.email,
      `${neighbor.firstname} ${neighbor.lastname}`,
      wasteDetails
    )

    return updatedTransaction
  }
}

export default RegisterWasteDeliveryUseCase
