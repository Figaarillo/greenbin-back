import { type FastifyReply, type FastifyRequest } from 'fastify'
import FindEntityByIDUseCase from '../../../entity/application/usecases/find-by-id.usecase'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import ErrorSchemaValidation from '../../../shared/domain/errors/schema-validation.error'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteGreenPointUseCase from '../../application/usecases/delete.usecase'
import FindGreenPointByIDUseCase from '../../application/usecases/find-by-id.usecase'
import ListGreenPointsUseCase from '../../application/usecases/list.usecase'
import RegisterGreenPointUseCase from '../../application/usecases/register.usecase'
import UpdateGreenPointUseCase from '../../application/usecases/update.usecase'
import type GreenPointPayload from '../../domain/payloads/green-point.payload'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterGreenPointDTO from '../dtos/register-green-point.dto'
import UpdateGreenPointDTO from '../dtos/update-green-point.dto'
import GreenPointSchemaValidator from '../middlewares/zod-schema-validator.middleware'

class GreenPointHandler {
  constructor(
    private readonly greenPointRepository: GreenPointRepository,
    private readonly entityRepository: EntityRepository
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listGreenPoints = new ListGreenPointsUseCase(this.greenPointRepository)
      const greenPoints = await listGreenPoints.exec(offset, limit)

      HandleHTTPResponse.OK(rep, 'Green points retrieved successfully', greenPoints)
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new GreenPointSchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findGreenPoint = new FindGreenPointByIDUseCase(this.greenPointRepository)
      const greenPoint = await findGreenPoint.exec(id)

      HandleHTTPResponse.OK(rep, 'Green point retrieved successfully', greenPoint)
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const payload: GreenPointPayload = req.body as GreenPointPayload

      const validateRegisterGreenPointSchema = new GreenPointSchemaValidator(RegisterGreenPointDTO, payload)
      validateRegisterGreenPointSchema.exec()

      const registerGreenPoint = new RegisterGreenPointUseCase(
        this.greenPointRepository,
        new FindEntityByIDUseCase(this.entityRepository)
      )
      const greenPoint = await registerGreenPoint.exec(payload)

      HandleHTTPResponse.Created(rep, 'Green point registered successfully', { id: greenPoint.id })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: GreenPointPayload = req.body as GreenPointPayload

      const validateIDSchema = new GreenPointSchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new GreenPointSchemaValidator(UpdateGreenPointDTO, payload)
      schemaValidator.exec()

      const updateGreenPoint = new UpdateGreenPointUseCase(this.greenPointRepository)
      await updateGreenPoint.exec(id, payload)

      HandleHTTPResponse.OK(rep, 'Green point updated successfully', { id })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new GreenPointSchemaValidator(CheckIdDTO, { id })
      schemaValidator.exec()

      const deleteGreenPoint = new DeleteGreenPointUseCase(this.greenPointRepository)
      await deleteGreenPoint.exec(id)

      HandleHTTPResponse.OK(rep, 'Green point deleted successfully', { id })
    } catch (error) {
      if (error instanceof ErrorSchemaValidation) {
        rep.status(400).send(error)
      } else {
        rep.status(500).send({ error: 'Internal Server Error', message: 'Something went wrong.' })
      }
    }
  }
}

export default GreenPointHandler
