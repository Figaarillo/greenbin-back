import FindNeighborByIDUseCase from '../../../neighbor/aplication/usecases/find-by-id.usecase'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import RegisterWasteTransactionDetailUseCase from '../../../waste-transaction-detail/application/usecases/register.usecase'
import type WasteTransactionDetailRepository from '../../../waste-transaction-detail/domain/repositories/waste-transaction-detail.repository'
import RegisterWasteUseCase from '../../../waste/application/usecases/register.usecase'
import type WasteEntity from '../../../waste/domain/entities/waste.entity'
import type WasteRepository from '../../../waste/domain/repositories/waste.repository'
import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import type WasteDeliveryPayload from '../../domain/payloads/waste-delivery.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'
import RegisterWasteTransactionUseCase from './register.usecase'

class RegisterWasteDeliveryUseCase {
  constructor(
    private readonly transactionDetailRepository: WasteTransactionDetailRepository,
    private readonly transactionRepository: WasteTransactionRepository,
    private readonly wasteRepository: WasteRepository,
    private readonly neighborRepository: NeighborRepository,
    private readonly payload: WasteDeliveryPayload
  ) {}

  async exec(): Promise<WasteTransactionEntity> {
    // const transaction = new WasteTransactionEntity(this.payload)
    // const transactionId = transaction.id as unknown as WasteTransactionEntity // Se parcea el id como WasteTransactionEntity para que funcione el RegisterWasteTransactionDetailUseCase
    const registerTransaction = new RegisterWasteTransactionUseCase(this.transactionRepository)
    const transaction = await registerTransaction.exec(this.payload)
    const transactionId = transaction.id as unknown as WasteTransactionEntity

    const registerWaste = new RegisterWasteUseCase(this.wasteRepository)
    const registerTransactionDetail = new RegisterWasteTransactionDetailUseCase(this.transactionDetailRepository)
    const { wastes } = this.payload

    for (const waste of wastes) {
      const newWaste = await registerWaste.exec(waste)
      const wasteId = newWaste.id as unknown as WasteEntity // Se parcea el id como WasteEntity para que funcione el RegisterWasteTransactionDetailUseCase

      const transactionDetail = await registerTransactionDetail.exec({ waste: wasteId, transaction: transactionId })
      const points = newWaste.calculatePoints()
      transactionDetail.points = points
      transactionDetail.pointsPerWeight = newWaste.pointsPerWeight

      // necesito agregarle los puntos al vecino, pero como el NeighborEntity que me pasan, en sí es un Id: string, no tengo forma de
      // acceder a sus metodos o atributos. Por lo tanto, o de eso se encarga el handler (buscar el neighbor por ID) o de eso se va a
      // tener que encargar el caso de uso, pero sabiendo que le pasan un id de tipo string por parametro

      const neighboriId = transaction.neighbor as unknown as string

      const findNeighbor = new FindNeighborByIDUseCase(this.neighborRepository)
      const neighbor = await findNeighbor.exec(neighboriId)
      neighbor.addPoints(points)
      neighbor.registerWaste(newWaste)

      transaction.addTransactionDetail(transactionDetail)
    }

    transaction.calculateTotalPoints()

    const updatedTransaction = await this.transactionRepository.update(transaction)
    if (updatedTransaction == null) {
      throw new Error('Cannot update transaction')
    }

    return updatedTransaction
  }
}

export default RegisterWasteDeliveryUseCase
