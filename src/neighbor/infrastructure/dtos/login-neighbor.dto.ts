import { z } from 'zod'
import { emailDTO, passwordDTO, usernameDTO } from './dto-types/dto-types'

const LoginNeighborDTO = z.object({
  username: usernameDTO.optional(),
  email: emailDTO.optional(),
  password: passwordDTO
})

export default LoginNeighborDTO
