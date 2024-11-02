import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import WasteTransactionDetailEntity from '../../../domain/entities/waste-transaction-detail.entity'
import type WasteTransactionDetailRepository from '../../../domain/repositories/waste-transaction-detail.repository'

class WasteTransactionDetailMikroORMRepository implements WasteTransactionDetailRepository {
  list!: (offset?: number | undefined, limit?: number | undefined) => Promise<Nullable<WasteTransactionDetailEntity[]>>

  async find(property: Record<string, string>): Promise<Nullable<WasteTransactionDetailEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(WasteTransactionDetailEntity, property)
  }

  async save(TransactionDetail: WasteTransactionDetailEntity): Promise<Nullable<WasteTransactionDetailEntity>> {
    const em = this.getEntityManager()
    await em.persist(TransactionDetail).flush()
    return TransactionDetail
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

export default WasteTransactionDetailMikroORMRepository
