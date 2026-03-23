import { RequestContext } from '@mikro-orm/core'
import ErrorEntityManagerNotFound from '../../../../shared/domain/errors/entity-manager-not-found.error'
import type Nullable from '../../../../shared/domain/types/nullable.type'
import CouponEntity from '../../../domain/entities/coupon.entity'
import ErrorCouponNotFound from '../../../domain/errors/coupon-not-found.error'
import { type CouponRelationship } from '../../../domain/enums/coupon.enum'
import type CouponRepository from '../../../domain/repositories/coupon.repository'
import type CouponUpdatePayload from '../../../domain/payloads/coupon.update.payload'

class CouponMikroORMRepository implements CouponRepository {
  async list(where: Record<string, any>, offset?: number, limit?: number): Promise<Nullable<CouponEntity[]>> {
    const em = this.getEntityManager()

    if (limit == null) return await em.find(CouponEntity, where)
    if (offset == null) return await em.find(CouponEntity, where, { limit })

    return await em.find(CouponEntity, where, { limit, offset })
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

  async save(newCoupon: CouponEntity): Promise<Nullable<CouponEntity>> {
    const em = this.getEntityManager()
    await em.persist(newCoupon).flush()
    return newCoupon
  }

  async update(id: string, payload: CouponUpdatePayload): Promise<Nullable<CouponEntity>> {
    const em = this.getEntityManager()

    const coupon = await em.findOne(CouponEntity, { id })
    if (coupon == null) return null

    coupon.update(payload)
    await em.flush()

    return coupon
  }

  async delete(id: string): Promise<void> {
    const em = this.getEntityManager()

    const coupon = await em.findOne(CouponEntity, { id })
    if (coupon == null) {
      throw new ErrorCouponNotFound(id)
    }

    await em.remove(coupon).flush()
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
