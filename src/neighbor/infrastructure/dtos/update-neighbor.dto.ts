import { z } from 'zod'
import { emailDTO, firstnameDTO, lastnameDTO, usernameDTO } from './dto-types/dto-types'

const UpdateNeighborDTO = z.object({
  firstname: firstnameDTO,
  lastname: lastnameDTO,
  username: usernameDTO,
  email: emailDTO
})

export default UpdateNeighborDTO
