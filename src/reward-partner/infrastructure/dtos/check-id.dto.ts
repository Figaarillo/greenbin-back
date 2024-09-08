import { z } from 'zod'
import { idDTO } from './dto-types/dto-types'

const CheckIdDTO = z.object({
  id: idDTO
})

export default CheckIdDTO
