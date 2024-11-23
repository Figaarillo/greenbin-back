import { z } from 'zod'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const CheckIdDTO = z.object({
  id: idDTO
})

export default CheckIdDTO
