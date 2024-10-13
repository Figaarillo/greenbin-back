import { z } from 'zod'
import { nameDTO, descriptionDTO, addressDTO, coordinatesDTO } from './dto-types/dto-types'

const RegisterGreenPointDTO = z.object({
  name: nameDTO,
  description: descriptionDTO,
  address: addressDTO,
  coordinates: coordinatesDTO
})

export default RegisterGreenPointDTO
