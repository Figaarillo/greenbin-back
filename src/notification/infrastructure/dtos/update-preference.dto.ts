import { z } from 'zod'

const UpdateNotificationPreferenceDTO = z.object({
  couponPurchased: z.boolean().optional(),
  couponRedeemed: z.boolean().optional(),
  couponCreated: z.boolean().optional(),
  pointsDelivered: z.boolean().optional()
})

export default UpdateNotificationPreferenceDTO
