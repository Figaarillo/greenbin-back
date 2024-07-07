import FindEntityByIDUseCase from '@entity/aplication/usecases/find-by-id.usecase'
import ListEntitiesUseCase from '@entity/aplication/usecases/list.usecase'
import RegisterEntityUseCase from '@entity/aplication/usecases/register.usecase'
import type EntityPayload from '@entity/domain/payloads/entity.payload'
import type EntityRepository from '@entity/domain/repositories/entity.repository'
import HandleHTTPResponse from '@shared/utils/http.response'
import { GetPaginationParams, GetURLParams } from '@shared/utils/http.utils'
import { type FastifyReply, type FastifyRequest } from 'fastify'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterEntityDTO from '../dtos/register-entity.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class EntityHandler {
  constructor(private readonly repository: EntityRepository) {
    this.repository = repository
  }

  async List(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listEntities = new ListEntitiesUseCase(this.repository)
      const entities = await listEntities.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Entities retrieved successfully', entities)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async FindByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const findEntity = new FindEntityByIDUseCase(this.repository)
      const entity = await findEntity.exec(id)

      HandleHTTPResponse.OK(res, 'Entity retrieved successfully', entity)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Register(req: FastifyRequest, res: FastifyReply): Promise<void> {
    try {
      const payload: EntityPayload = req.body as EntityPayload

      const validateRegisterEntitySchema = new SchemaValidator(RegisterEntityDTO, payload)
      validateRegisterEntitySchema.exec()

      const registerEntity = new RegisterEntityUseCase(this.repository)
      const entity = await registerEntity.exec(payload)

      HandleHTTPResponse.Created(res, 'Entity registered successfully', { id: entity.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default EntityHandler
