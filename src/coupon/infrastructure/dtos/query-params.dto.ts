import { z } from 'zod'
import { CouponRelationship } from '../../domain/enums/coupon.enum'

const CouponQueryParams = z.object({
  id: z.string().uuid(),
  with: z.preprocess(value => (typeof value === 'string' ? [value] : value), z.array(z.nativeEnum(CouponRelationship)))
})

export default CouponQueryParams
