import ErrorGreenPointNotFound from '../../../green-point/domain/errors/green-point-not-found.error'
import ErrorNeighborNotFound from '../../../neighbor/domain/errors/neighbor-not-found.error'
import ErrorResponsibleNotFound from '../../../responsible/domain/errors/responsible-not-found.error'
import WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import ErrorCannotSaveWasteTransaction from '../../domain/errors/cannot-save-waste-transaction.error'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class RegisterWasteTransactionUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(payload: WasteTransactionPayload): Promise<WasteTransactionEntity> {
    const responsible = await this.repository.findResponsible({ id: payload.responsibleId })
    if (responsible == null) throw new ErrorResponsibleNotFound(payload.responsibleId)

    const neighbor = await this.repository.findNeighbor({ id: payload.neighborId })
    if (neighbor == null) throw new ErrorNeighborNotFound(payload.neighborId)

    const greenPoint = await this.repository.fidnGreenPoint({ id: payload.greenPointId })
    if (greenPoint == null) throw new ErrorGreenPointNotFound(payload.greenPointId)

    const transaction = new WasteTransactionEntity(responsible, neighbor, greenPoint)
    const savedTransaction = await this.repository.save(transaction)

    if (savedTransaction == null) throw new ErrorCannotSaveWasteTransaction()

    return savedTransaction
  }
}

export default RegisterWasteTransactionUseCase
