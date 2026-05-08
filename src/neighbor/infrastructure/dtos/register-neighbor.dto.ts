import { z } from 'zod'
import {
  birthdateDTO,
  dniDTO,
  emailDTO,
  firstnameDTO,
  lastnameDTO,
  passwordDTO,
  phoneNumberDTO,
  usernameDTO
} from './dto-types/dto-types'

const RegisterNeighborDTO = z.object({
  firstname: firstnameDTO,
  lastname: lastnameDTO,
  username: usernameDTO,
  email: emailDTO,
  password: passwordDTO,
  dni: dniDTO,
  phoneNumber: phoneNumberDTO,
  birthdate: birthdateDTO
})

export default RegisterNeighborDTO
