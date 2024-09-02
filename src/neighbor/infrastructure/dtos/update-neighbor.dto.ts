import { z } from 'zod'
import { emailDTO, firstnameDTO, lastnameDTO, phoneNumberDTO, usernameDTO } from './dto-types/dto-types'

const UpdateNeighborDTO = z.object({
  firstname: firstnameDTO.optional(),
  lastname: lastnameDTO.optional(),
  username: usernameDTO.optional(),
  email: emailDTO.optional(),
  phoneNumer: phoneNumberDTO.optional()
})

export default UpdateNeighborDTO
