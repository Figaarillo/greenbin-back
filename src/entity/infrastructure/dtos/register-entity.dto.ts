import { z } from 'zod'
import {
  nameDTO,
  descriptionDTO,
  passwordDTO,
  cityDTO,
  provinceDTO
} from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterEntityDTO = z.object({
  name: nameDTO,
  description: descriptionDTO,
  password: passwordDTO,
  city: cityDTO,
  province: provinceDTO
})

export default RegisterEntityDTO
