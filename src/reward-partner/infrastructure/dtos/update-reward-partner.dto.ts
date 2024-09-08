import { z } from 'zod'
import { addressDTO, emailDTO, nameDTO } from './dto-types/dto-types'

const UpdateRewardPartnerDTO = z.object({
  name: nameDTO.optional(),
  address: addressDTO.optional(),
  email: emailDTO.optional(),
  phoneNumber: z.string().optional()
})

export default UpdateRewardPartnerDTO
