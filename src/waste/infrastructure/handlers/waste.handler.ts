import { type FastifyReply, type FastifyRequest } from 'fastify'
import SchemaValidator from '../../../shared/infrastructure/middlewares/zod-schema-validator.middleware'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetURLParams } from '../../../shared/utils/http.request.util'
import FindWasteCategoryByIDUseCase from '../../../waste-category/application/usecases/find-by-id.usecase'
import type WasteCategoryRepository from '../../../waste-category/domain/repositories/waste-category.repository'
import FindWasteByIDUseCase from '../../application/usecases/find-by-id.usecase'
import RegisterWasteUseCase from '../../application/usecases/register.usecase'
import type WastePayload from '../../domain/payloads/waste.payload'
import type WasteRepository from '../../domain/repositories/waste.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterWasteDTO from '../dtos/register-waste.dto'

class WasteHandler {
  constructor(
    private readonly wasteRepository: WasteRepository,
    private readonly categoryReposiotry: WasteCategoryRepository
  ) {}

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findByID = new FindWasteByIDUseCase(this.wasteRepository)
      const category = await findByID.exec(id)

      HandleHTTPResponse.OK(res, 'Waste retrieved successfully', category)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: WastePayload = req.body as WastePayload

      const validateRegisterWasteSchema = new SchemaValidator(RegisterWasteDTO, payload)
      validateRegisterWasteSchema.exec()

      const registerWaste = new RegisterWasteUseCase(
        this.wasteRepository,
        new FindWasteCategoryByIDUseCase(this.categoryReposiotry)
      )
      const waste = await registerWaste.exec(payload)

      HandleHTTPResponse.Created(res, 'Waste registered successfully', { id: waste.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default WasteHandler
