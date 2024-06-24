import { z } from 'zod'
import {
  firstNameDTO,
  lastNameDTO,
  phoneNumberDTO,
  emailDTO,
  passwordDTO,
  cityDTO,
  provinceDTO,
  countryDTO,
  roleDTO
} from './dto-types/dto-types'

const SaveUserDTO = z.object({
  firstName: firstNameDTO,
  lastName: lastNameDTO,
  phoneNumber: phoneNumberDTO,
  email: emailDTO,
  password: passwordDTO,
  city: cityDTO,
  province: provinceDTO,
  country: countryDTO,
  role: roleDTO
})

export default SaveUserDTO
