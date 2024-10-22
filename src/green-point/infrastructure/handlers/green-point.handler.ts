import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteGreenPointUseCase from '../../aplication/usecases/delete.usecase'
import FindGreenPointByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListGreenPointsUseCase from '../../aplication/usecases/list.usecase'
import RegisterGreenPointUseCase from '../../aplication/usecases/register.usecase'
import UpdateGreenPointUseCase from '../../aplication/usecases/update.usecase'
import type GreenPointPayload from '../../domain/payloads/green-point.payload'
import type GreenPointRepository from '../../domain/repositories/green-point.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterGreenPointDTO from '../dtos/register-green-point.dto'
import UpdateGreenPointDTO from '../dtos/update-green-point.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class GreenPointHandler {
  constructor(private readonly repository: GreenPointRepository) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listGreenPoints = new ListGreenPointsUseCase(this.repository)
      const greenPoints = await listGreenPoints.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Green points retrieved successfully', greenPoints)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findGreenPoint = new FindGreenPointByIDUseCase(this.repository)
      const greenPoint = await findGreenPoint.exec(id)

      HandleHTTPResponse.OK(res, 'Green point retrieved successfully', greenPoint)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: GreenPointPayload = req.body as GreenPointPayload

      const validateRegisterGreenPointSchema = new SchemaValidator(RegisterGreenPointDTO, payload)
      validateRegisterGreenPointSchema.exec()

      const registerGreenPoint = new RegisterGreenPointUseCase(this.repository)
      const greenPoint = await registerGreenPoint.exec(payload)

      HandleHTTPResponse.Created(res, 'Green point registered successfully', { id: greenPoint.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: GreenPointPayload = req.body as GreenPointPayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateGreenPointDTO, payload)
      schemaValidator.exec()

      const updateGreenPoint = new UpdateGreenPointUseCase(this.repository)
      await updateGreenPoint.exec(id, payload)

      HandleHTTPResponse.OK(res, 'Green point updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new SchemaValidator(CheckIdDTO, { id })
      schemaValidator.exec()

      const deleteGreenPoint = new DeleteGreenPointUseCase(this.repository)
      await deleteGreenPoint.exec(id)

      HandleHTTPResponse.OK(res, 'Green point deleted successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default GreenPointHandler
