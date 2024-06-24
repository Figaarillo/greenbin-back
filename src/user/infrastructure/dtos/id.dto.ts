import { z } from 'zod'
import { idDTO } from './dto-types/dto-types'

const IdDTO = z.object({
  id: idDTO
})

export default IdDTO
