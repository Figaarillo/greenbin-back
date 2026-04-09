import type WasteTransactionEntity from '../../domain/entities/waste-transaction.entity'
import type WasteTransactionRepository from '../../domain/repositories/waste-transaction.repository'

class ListWasteTransactionsByResponsibleUseCase {
  constructor(private readonly repository: WasteTransactionRepository) {}

  async exec(responsibleId: string): Promise<WasteTransactionEntity[]> {
    return await this.repository.findByResponsible(responsibleId)
  }
}

export default ListWasteTransactionsByResponsibleUseCase
