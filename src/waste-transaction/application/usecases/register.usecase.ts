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
    const responsible = await this.repository.findResponsible({ id: payload.responsible })
    if (responsible == null) throw new ErrorResponsibleNotFound(payload.responsible)

    const neighbor = await this.repository.findNeighbor({ id: payload.neighbor })
    if (neighbor == null) throw new ErrorNeighborNotFound(payload.neighbor)

    const greenPoint = await this.repository.fidnGreenPoint({ id: payload.greenPoint })
    if (greenPoint == null) throw new ErrorGreenPointNotFound(payload.greenPoint)

    const transaction = new WasteTransactionEntity(responsible, neighbor, greenPoint)
    const savedTransaction = await this.repository.save(transaction)

    if (savedTransaction == null) throw new ErrorCannotSaveWasteTransaction()

    return savedTransaction
  }
}

export default RegisterWasteTransactionUseCase
