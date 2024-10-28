import { z } from 'zod'
import { nameDTO, descriptionDTO, addressDTO, coordinatesDTO, emailDTO, phoneNumberDTO } from './dto-types/dto-types'

const RegisterGreenPointDTO = z.object({
  name: nameDTO,
  email: emailDTO,
  phoneNumber: phoneNumberDTO,
  description: descriptionDTO,
  address: addressDTO,
  coordinates: coordinatesDTO
})

export default RegisterGreenPointDTO
