import { z } from 'zod'
import { emailDTO, passwordDTO, usernameDTO } from './dto-types/dto-types'

const LoginRewardPartnerDTO = z.object({
  username: usernameDTO.optional(),
  email: emailDTO.optional(),
  password: passwordDTO
})

export default LoginRewardPartnerDTO
