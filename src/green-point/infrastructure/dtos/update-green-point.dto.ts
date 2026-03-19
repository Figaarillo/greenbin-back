import { z } from 'zod'
import { descriptionDTO, emailDTO, nameDTO, phoneNumberDTO } from './dto-types/dto-types'

const UpdateGreenPointDTO = z.object({
  name: nameDTO.optional(),
  email: emailDTO.optional(),
  phoneNumber: phoneNumberDTO.optional(),
  description: descriptionDTO.optional()
})

export default UpdateGreenPointDTO
