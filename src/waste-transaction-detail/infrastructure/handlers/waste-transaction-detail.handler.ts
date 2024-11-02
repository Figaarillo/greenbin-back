import { type FastifyReply, type FastifyRequest } from 'fastify'
import SchemaValidator from '../../../shared/infrastructure/middlewares/zod-schema-validator.middleware'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLParams } from '../../../shared/utils/http.request.util'
import FindWasteTransactionDetailByIDUseCase from '../../application/usecases/find-by-id.usecase'
import RegisterWasteTransactionDetailUseCase from '../../application/usecases/register.usecase'
import type WasteTransactionDetailPayload from '../../domain/payloads/waste-transaction-detail.payload'
import type WasteTransactionDetailRepository from '../../domain/repositories/waste-transaction-detail.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterWasteTransactionDetailDTO from '../dtos/register-waste-transaction-detail.dto'

class WasteTransactionDetailHandler {
  constructor(private readonly repository: WasteTransactionDetailRepository) {
    this.repository = repository
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findWasteTransactionDetail = new FindWasteTransactionDetailByIDUseCase(this.repository)
      const wasteTransactionDetail = await findWasteTransactionDetail.exec(id)

      HandleHTTPResponse.OK(res, 'Waste transaction detail  retrieved successfully', wasteTransactionDetail)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: WasteTransactionDetailPayload = req.body as WasteTransactionDetailPayload

      const validateRegisterSchema = new SchemaValidator(RegisterWasteTransactionDetailDTO, payload)
      validateRegisterSchema.exec()

      const registerWasteTransactionDetail = new RegisterWasteTransactionDetailUseCase(this.repository)
      const WasteTransactionDetail = await registerWasteTransactionDetail.exec(payload)

      HandleHTTPResponse.Created(res, 'Waste transaction detail registered successfully', {
        id: WasteTransactionDetail.id
      })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default WasteTransactionDetailHandler
