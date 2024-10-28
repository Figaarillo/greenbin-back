import { z } from 'zod'
import { descriptionDTO, emailDTO, nameDTO, phoneNumberDTO } from './dto-types/dto-types'

const UpdateGreenPointDTO = z.object({
  name: nameDTO.optional(),
  email: emailDTO,
  phoneNumber: phoneNumberDTO,
  description: descriptionDTO.optional()
})

export default UpdateGreenPointDTO
