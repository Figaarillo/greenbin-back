import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/aplicaction/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTProvider from '../../../auth/domain/providers/jwt.interface.provider'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteEntityUseCase from '../../aplication/usecases/delete.usecase'
import FindByEmailUseCase from '../../aplication/usecases/find-by-email.usecase'
import FindEntityByIDUseCase from '../../aplication/usecases/find-by-id.usecase'
import ListEntitiesUseCase from '../../aplication/usecases/list.usecase'
import LoginEntityUseCase from '../../aplication/usecases/login.usecase'
import RegisterEntityUseCase from '../../aplication/usecases/register.usecase'
import UpdateEntityUseCase from '../../aplication/usecases/update.usecase'
import type EntityLoginPayload from '../../domain/payloads/entity.login.payload'
import type EntityPayload from '../../domain/payloads/entity.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'
import CheckIdDTO from '../dtos/check-id.dto'
import RegisterEntityDTO from '../dtos/register-entity.dto'
import UpdateEntityDTO from '../dtos/update-entity.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class EntityHandler {
  constructor(
    private readonly repository: EntityRepository,
    private readonly jwtProvider: IJWTProvider
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const { offset, limit } = GetPaginationParams(req)

      const listEntities = new ListEntitiesUseCase(this.repository)
      const entities = await listEntities.exec(offset, limit)

      HandleHTTPResponse.OK(res, 'Entities retrieved successfully', entities)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
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

  async register(req: FastifyRequest, res: FastifyReply): Promise<void> {
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

  async update(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const payload: { description: string } = req.body as { description: string }

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

  async delete(req: FastifyRequest<{ Params: { id: string } }>, res: FastifyReply): Promise<void> {
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

  async login(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const payload = req.body as EntityLoginPayload

      const usecase = new LoginEntityUseCase(this.repository)
      const entity = await usecase.exec(payload)

      const authService = new AuthService(this.jwtProvider)
      const accessToken = await authService.generateAccessToken(entity.id, {
        name: entity.name,
        email: entity.email,
        role: entity.role
      })
      const refreshToken = await authService.generateRefreshToken(entity.id, {
        name: entity.name,
        email: entity.email,
        role: entity.role
      })

      HandleHTTPResponse.Created(rep, 'Entity logged in successfully', {
        id: entity.id,
        accessToken,
        refreshToken
      })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenEntity = req.entity as { username: string; email: string; role: string }

      const usecase = new FindByEmailUseCase(this.repository)
      const entity = await usecase.exec(tokenEntity.email)

      const authService = new AuthService(this.jwtProvider)
      const accessToken = await authService.generateAccessToken(req.entity.id, {
        name: entity.name,
        email: entity.email,
        role: entity.role
      })

      HandleHTTPResponse.OK(rep, 'Token refreshed successfully', { accessToken })
    } catch (error) {
      rep.status(500).send(error)
    }
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    try {
      const tokenEntity = req.tokenRole
      if (tokenEntity !== Roles.ENTITY) {
        throw new Error('Invalid role')
      }
      HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
    } catch (error) {
      rep.status(500).send(error)
    }
  }
}

export default EntityHandler
