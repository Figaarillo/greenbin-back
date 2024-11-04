import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import WasteTransactionEntity from '../../../domain/entities/waste-transaction.entity'
import type WasteTransactionRepository from '../../../domain/repositories/waste-transaction.repository'
import ResponsibleEntity from '../../../../responsible/domain/entities/responsible.entity'
import NeighborEntity from '../../../../neighbor/domain/entities/neighbor.entity'
import GreenPointEntity from '../../../../green-point/domain/entities/green-point.entity'

class WasteTransactionMikroORMRepository implements WasteTransactionRepository {
  list!: (offset?: number | undefined, limit?: number | undefined) => Promise<Nullable<WasteTransactionEntity[]>>

  async find(property: Record<string, string>): Promise<Nullable<WasteTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(WasteTransactionEntity, property)
  }

  async findResponsible(property: Record<string, string>): Promise<Nullable<ResponsibleEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(ResponsibleEntity, property)
  }

  async findNeighbor(property: Record<string, string>): Promise<Nullable<NeighborEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(NeighborEntity, property)
  }

  async fidnGreenPoint(property: Record<string, string>): Promise<Nullable<GreenPointEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(GreenPointEntity, property)
  }

  async save(transaction: WasteTransactionEntity): Promise<Nullable<WasteTransactionEntity>> {
    const em = this.getEntityManager()
    await em.persist(transaction).flush()
    return transaction
  }

  async update(transaction: WasteTransactionEntity): Promise<Nullable<WasteTransactionEntity>> {
    const em = this.getEntityManager()
    await em.persist(transaction).flush()
    return transaction
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private getEntityManager() {
    const em = RequestContext.getEntityManager()
    if (em == null) {
      throw new ErrorEntityManagerNotFound()
    }

    return em
  }
}

export default WasteTransactionMikroORMRepository
