import { type FastifyReply, type FastifyRequest } from 'fastify'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteEntityUseCase from '../../aplication/usecases/delete.usecase'
import FindEntityByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListEntitiesUseCase from '../../aplication/usecases/list.usecase'
import RegisterEntityUseCase from '../../aplication/usecases/register.usecase'
import UpdateEntityUseCase from '../../aplication/usecases/update.usecase'
import type EntityPayload from '../../domain/payloads/entity.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterEntityDTO from '../dtos/register-entity.dto'
import UpdateEntityDTO from '../dtos/update-entity.dto'
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

      const validateRegisterEntitiesSchema = new SchemaValidator(RegisterEntityDTO, payload)
      validateRegisterEntitiesSchema.exec()

      const registerEntity = new RegisterEntityUseCase(this.repository)
      const entity = await registerEntity.exec(payload)

      HandleHTTPResponse.Created(res, 'Entity registered successfully', { id: entity.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: EntityPayload = req.body as EntityPayload

      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateEntityDTO, payload)
      schemaValidator.exec()

      const updateEntity = new UpdateEntityUseCase(this.repository)
      await updateEntity.exec(id, payload)

      HandleHTTPResponse.OK(res, 'Entity updated successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async Delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')

      const schemaValidator = new SchemaValidator(CheckIdDTO, { id })
      schemaValidator.exec()

      const deleteEntity = new DeleteEntityUseCase(this.repository)
      await deleteEntity.exec(id)

      HandleHTTPResponse.OK(res, 'Entity deleted successfully', { id })
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

export default EntityHandler
