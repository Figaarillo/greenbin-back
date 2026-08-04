import { z } from 'zod'
import { addressDTO, coordinatesDTO, descriptionDTO, emailDTO, nameDTO, phoneNumberDTO } from './dto-types/dto-types'

const UpdateGreenPointDTO = z.object({
  name: nameDTO.optional(),
  email: emailDTO.optional(),
  phoneNumber: phoneNumberDTO.optional(),
  description: descriptionDTO.optional(),
  address: addressDTO.optional(),
  coordinates: coordinatesDTO.optional()
})

export default UpdateGreenPointDTO
