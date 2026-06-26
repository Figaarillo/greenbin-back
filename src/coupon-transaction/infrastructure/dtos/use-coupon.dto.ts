import { z } from 'zod'

const UseCouponDTO = z.object({
  code: z.string().length(6),
  rewardPartnerId: z.string().uuid()
})

export default UseCouponDTO
