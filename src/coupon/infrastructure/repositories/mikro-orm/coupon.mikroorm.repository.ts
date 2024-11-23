import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import CouponEntity from '../../../domain/entities/coupon.entity'
import { type CouponRelationship } from '../../../domain/enums/coupon.enum'
import type CouponRepository from '../../../domain/repositories/coupon.repository'

class CouponMikroORMRepository implements CouponRepository {
  async list(offset?: number, limit?: number): Promise<Nullable<CouponEntity[]>> {
    const em = this.getEntityManager()
    if (limit == null) return await em.find(CouponEntity, {})
    if (offset == null) return await em.find(CouponEntity, {}, { limit })
    return await em.find(CouponEntity, {}, { limit, offset })
  }

  async find(property: Record<string, string>): Promise<Nullable<CouponEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(CouponEntity, property)
  }

  async findAndPopulate(
    property: Record<string, string>,
    populate: CouponRelationship[]
  ): Promise<Nullable<CouponEntity>> {
    const em = this.getEntityManager()
    return await em.findOne(CouponEntity, property, { populate })
  }

  async save(newCategory: CouponEntity): Promise<Nullable<CouponEntity>> {
    const em = this.getEntityManager()
    await em.persist(newCategory).flush()
    return newCategory
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

export default CouponMikroORMRepository
