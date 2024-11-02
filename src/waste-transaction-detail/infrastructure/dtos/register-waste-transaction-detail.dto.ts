import { z } from 'zod'
import { idDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteTransactionDTO = z.object({
  waste: idDTO
})

export default RegisterWasteTransactionDTO
