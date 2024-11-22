import { z } from 'zod'
import {
  addressDTO,
  coordinatesDTO,
  cuitDTO,
  emailDTO,
  nameDTO,
  passwordDTO,
  phoneNumberDTO,
  usernameDTO
} from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterRewardPartnerDTO = z.object({
  name: nameDTO,
  username: usernameDTO,
  address: addressDTO,
  cuit: cuitDTO,
  email: emailDTO,
  password: passwordDTO,
  phoneNumber: phoneNumberDTO,
  coordinates: coordinatesDTO
})

export default RegisterRewardPartnerDTO
