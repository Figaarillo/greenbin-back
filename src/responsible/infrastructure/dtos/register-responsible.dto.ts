import { z } from 'zod'
import {
  dniDTO,
  emailDTO,
  firstnameDTO,
  lastnameDTO,
  passwordDTO,
  phoneNumberDTO,
  usernameDTO
} from './dto-types/dto-types'

const RegisterResponsibleDTO = z.object({
  firstname: firstnameDTO,
  lastname: lastnameDTO,
  username: usernameDTO,
  email: emailDTO,
  password: passwordDTO,
  dni: dniDTO,
  phoneNumber: phoneNumberDTO
})

export default RegisterResponsibleDTO
