import { z } from 'zod'
import { addressDTO, cuitDTO, emailDTO, nameDTO, passwordDTO } from './dto-types/dto-types'

const RegisterRewardPartnerDTO = z.object({
  name: nameDTO,
  address: addressDTO,
  cuit: cuitDTO,
  email: emailDTO,
  password: passwordDTO
})

export default RegisterRewardPartnerDTO
