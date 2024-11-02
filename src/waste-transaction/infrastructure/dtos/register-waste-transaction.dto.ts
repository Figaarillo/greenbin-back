import { z } from 'zod'
import { nameDTO } from '../../../shared/infrastructure/dto-types/dto-types'

const RegisterWasteTransactionDTO = z.object({
  responsible: nameDTO,
  neighbor: nameDTO,
  greenPointd: nameDTO,
  transactionDetails: nameDTO
})

export default RegisterWasteTransactionDTO
