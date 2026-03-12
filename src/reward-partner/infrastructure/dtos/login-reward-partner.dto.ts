import { z } from 'zod'
import { usernameDTO, emailDTO, passwordDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const LoginRewardPartnerDTO = z.object({
  username: usernameDTO.optional(),
  email: emailDTO.optional(),
  password: passwordDTO
})

export default LoginRewardPartnerDTO
