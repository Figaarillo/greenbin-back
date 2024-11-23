import { z } from 'zod'
import { nameDTO, addressDTO, emailDTO, phoneNumberDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const UpdateRewardPartnerDTO = z.object({
  name: nameDTO.optional(),
  address: addressDTO.optional(),
  email: emailDTO.optional(),
  phoneNumber: phoneNumberDTO.optional()
})

export default UpdateRewardPartnerDTO
