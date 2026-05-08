import { z } from 'zod'
import { usernameDTO, phoneNumberDTO } from './dto-types/dto-types'

const UpdateResponsibleDTO = z.object({
  username: usernameDTO.optional(),
  phoneNumber: phoneNumberDTO.optional()
})

export default UpdateResponsibleDTO
