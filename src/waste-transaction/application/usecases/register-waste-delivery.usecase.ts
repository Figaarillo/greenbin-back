import type FindNeighborByIDUseCase from '../../../neighbor/application/usecases/find-by-id.usecase'
import type FindResponsibleByIDUseCase from '../../../responsible/application/usecases/find-by-id.usecase'
import type RegisterWasteTransactionDetailUseCase from '../../../waste-transaction-detail/application/usecases/register.usecase'
import type RegisterWasteUseCase from '../../../waste/application/usecases/register.usecase'
import { Roles } from '../../../auth/domain/entities/role'
import { NotificationCategory } from '../../../notification/domain/enums/notification-category.enum'
import type NotificationDispatcher from '../../../notification/application/service/notification-dispatcher.service'
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
    private readonly findResponsibleByID: FindResponsibleByIDUseCase,
    private readonly notificationDispatcher: NotificationDispatcher
  ) {}

  async exec(payload: WasteDeliveryPayload): Promise<WasteTransactionEntity> {
    const transaction = await this.registerTransaction.exec(payload)
    const { wastes, neighborId, responsibleId } = payload

    const neighbor = await this.findNeighborByID.exec(neighborId)
    const responsible = await this.findResponsibleByID.exec(responsibleId)
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

    void this.notificationDispatcher.dispatch({
      recipientId: neighbor.id,
      recipientRole: Roles.NEIGHBOR,
      category: NotificationCategory.POINTS_DELIVERED,
      title: 'Entrega registrada',
      body: `Se registró tu entrega y sumaste ${transaction.totalPoints} puntos.`,
      sendEmail: async emailService => {
        await emailService.sendWasteDeliveryConfirmation(
          neighbor.email,
          `${neighbor.firstname} ${neighbor.lastname}`,
          wasteDetails
        )
      }
    })

    // Al responsable solo in-app por ahora: el pedido no especificó canal de
    // mail para él. Si se pide despues, es agregar un sendEmail acá, sin
    // tocar el dispatcher.
    void this.notificationDispatcher.dispatch({
      recipientId: responsible.id,
      recipientRole: Roles.RESPONSIBLE,
      category: NotificationCategory.POINTS_DELIVERED,
      title: 'Entrega de puntos registrada',
      body: `Registraste una entrega para ${neighbor.firstname} ${neighbor.lastname} (${transaction.totalPoints} pts).`
    })

    return updatedTransaction
  }
}

export default RegisterWasteDeliveryUseCase
