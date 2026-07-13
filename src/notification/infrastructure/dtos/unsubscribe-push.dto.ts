import { z } from 'zod'

const UnsubscribePushDTO = z.object({
  endpoint: z.string().url()
})

export default UnsubscribePushDTO
