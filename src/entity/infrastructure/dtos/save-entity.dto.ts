import { z } from 'zod'
import { cityDTO, descriptionDTO, nameDTO, passwordDTO, provinceDTO } from './dto-types/dto-types'

const SaveEntityDTO = z.object({
  name: nameDTO,
  description: descriptionDTO,
  password: passwordDTO,
  city: cityDTO,
  province: provinceDTO
})

export default SaveEntityDTO
