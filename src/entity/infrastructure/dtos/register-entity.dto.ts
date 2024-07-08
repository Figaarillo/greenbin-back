import { z } from 'zod'
import { cityDTO, descriptionDTO, nameDTO, passwordDTO, provinceDTO } from './dto-types/dto-types'

const RegisterEntityDTO = z.object({
  name: nameDTO,
  description: descriptionDTO,
  password: passwordDTO,
  city: cityDTO,
  province: provinceDTO
})

export default RegisterEntityDTO
