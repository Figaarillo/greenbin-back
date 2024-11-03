import ErrorGreenPointNotFound from '../../../green-point/domain/errors/green-point-not-found.error'
import ErrorNeighborNotFound from '../../../neighbor/domain/errors/neighbor-not-found.error'
import ErrorResponsibleNotFound from '../../../responsible/domain/errors/responsible-not-found.error'
import WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import ErrorCannotSaveWasteTransaction from '../../domain/errors/cannot-save-waste-transaction.error'
import type WasteTransactionPayload from '../../domain/payloads/waste-transaction.payload'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class RegisterWasteTransactionUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(payload: WasteTransactionPayload): Promise<any> {
    console.log({ payload })

    const idResponsible: string = payload.responsible as unknown as string
    const idNeighbor: string = payload.neighbor as unknown as string
    const idGreenPoint: string = payload.greenPoint as unknown as string

    const responsible = await this.repository.findResponsible({ id: idResponsible })
    if (responsible == null) {
      throw new ErrorResponsibleNotFound(idResponsible)
    }

    const neighbor = await this.repository.findNeighbor({ id: idNeighbor })
    if (neighbor == null) {
      throw new ErrorNeighborNotFound(idNeighbor)
    }

    const greenPoint = await this.repository.fidnGreenPoint({ id: idGreenPoint })
    if (greenPoint == null) {
      throw new ErrorGreenPointNotFound(idGreenPoint)
    }

    const newTransaction = new WasteTransactionEntity(payload)

    console.log({ newTransaction })

    const wasteTransaction = await this.repository.save(newTransaction)
    if (wasteTransaction == null) {
      throw new ErrorCannotSaveWasteTransaction()
    }

    return wasteTransaction
  }
}

export default RegisterWasteTransactionUseCase
