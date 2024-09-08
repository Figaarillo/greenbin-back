import { z } from 'zod'
import { addressDTO, cuitDTO, emailDTO, nameDTO, passwordDTO, phoneNumberDTO, usernameDTO } from './dto-types/dto-types'

const RegisterRewardPartnerDTO = z.object({
  name: nameDTO,
  username: usernameDTO,
  address: addressDTO,
  cuit: cuitDTO,
  email: emailDTO,
  password: passwordDTO,
  phoneNumber: phoneNumberDTO
})

export default RegisterRewardPartnerDTO
