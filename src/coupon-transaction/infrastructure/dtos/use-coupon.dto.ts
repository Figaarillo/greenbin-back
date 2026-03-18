import { z } from 'zod'

const UseCouponDTO = z.object({
  code: z.string().length(6),
  rewardPartnerId: z.string().uuid(),
  totalAmount: z.number().positive()
})

export default UseCouponDTO
