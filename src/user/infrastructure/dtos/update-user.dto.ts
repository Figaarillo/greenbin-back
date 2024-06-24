import { z } from 'zod'
import {
  firstNameDTO,
  lastNameDTO,
  phoneNumberDTO,
  emailDTO,
  cityDTO,
  provinceDTO,
  countryDTO,
  roleDTO
} from './dto-types/dto-types'

const UpdateUserDTO = z.object({
  firstName: firstNameDTO.optional(),
  lastName: lastNameDTO.optional(),
  phoneNumber: phoneNumberDTO.optional(),
  email: emailDTO.optional(),
  city: cityDTO.optional(),
  province: provinceDTO.optional(),
  country: countryDTO.optional(),
  role: roleDTO.optional()
})

export default UpdateUserDTO
