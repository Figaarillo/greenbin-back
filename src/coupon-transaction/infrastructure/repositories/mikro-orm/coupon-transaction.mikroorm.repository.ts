import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import CouponTransactionEntity from '../../../domain/entities/coupon-transaction.entity'
import type CouponTransactionRepository from '../../../domain/repositories/coupon-transaction.repository'

class CouponTransactionMikroORMRepository implements CouponTransactionRepository {
  list!: (offset?: number | undefined, limit?: number | undefined) => Promise<Nullable<CouponTransactionEntity[]>>

  async find(property: Record<string, string>): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(CouponTransactionEntity, property)
  }

  async findByNeighbor(neighborId: string): Promise<CouponTransactionEntity[]> {
    const em = this.getEntityManager()
    return await em.find(CouponTransactionEntity, { neighbor: neighborId }, { populate: ['coupon', 'rewardPartner'] })
  }

  async findByRewardPartner(rewardPartnerId: string): Promise<CouponTransactionEntity[]> {
    const em = this.getEntityManager()
    return await em.find(
      CouponTransactionEntity,
      { rewardPartner: rewardPartnerId },
      { populate: ['coupon', 'neighbor'] }
    )
  }

  async findById(id: string): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(CouponTransactionEntity, { id }, { populate: ['coupon', 'rewardPartner', 'neighbor'] })
  }

  async findByCode(code: string): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(CouponTransactionEntity, { code }, { populate: ['coupon', 'rewardPartner', 'neighbor'] })
  }

  async save(transaction: CouponTransactionEntity): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()
    await em.persist(transaction).flush()
    return transaction
  }

  async update(id: string, transaction: CouponTransactionEntity): Promise<Nullable<CouponTransactionEntity>> {
    const em = this.getEntityManager()

    const entity = await em.findOne(CouponTransactionEntity, { id })
    if (entity == null) return null

    entity.status = transaction.status
    entity.redeemDate = transaction.redeemDate
    await em.flush()

    return entity
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

export default CouponTransactionMikroORMRepository
