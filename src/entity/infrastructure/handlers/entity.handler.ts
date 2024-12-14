import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import CheckIdDTO from '../../../shared/infrastructure/dto-types/check-id.dto'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { GetPaginationParams, GetURLParams } from '../../../shared/utils/http.request.util'
import DeleteEntityUseCase from '../../application/usecases/delete.usecase'
import FindEntityWithPopulateUseCase from '../../application/usecases/find-and-populate.usecase'
import FindByEmailUseCase from '../../application/usecases/find-by-email.usecase'
import FindEntityByIDUseCase from '../../application/usecases/find-by-id.usecase'
import ListEntitiesUseCase from '../../application/usecases/list.usecase'
import LoginEntityUseCase from '../../application/usecases/login.usecase'
import RegisterEntityUseCase from '../../application/usecases/register.usecase'
import UpdateEntityUseCase from '../../application/usecases/update.usecase'
import type EntityLoginPayload from '../../domain/payloads/entity.login.payload'
import type EntityPayload from '../../domain/payloads/entity.payload'
import type EntityRepository from '../../domain/repositories/entity.repository'
import EntityQueryParams from '../dtos/query-params.dto'
import RegisterEntityDTO from '../dtos/register-entity.dto'
import UpdateEntityDTO from '../dtos/update-entity.dto'
import SchemaValidator from '../middlewares/zod-schema-validator.middleware'

class EntityHandler {
  constructor(
    private readonly repository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy
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

  async findAndPopulate(req: FastifyRequest<{ Params: Record<string, string> }>, res: FastifyReply): Promise<void> {
    try {
      const params = EntityQueryParams.parse(req.query)

      const findWithPopulate = new FindEntityWithPopulateUseCase(this.repository)
      const entity = await findWithPopulate.exec(params.id, params.with)

      HandleHTTPResponse.OK(res, 'Entity retrieved successfully', entity)
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async register(req: FastifyRequest<{ Body: EntityPayload }>, res: FastifyReply): Promise<void> {
    try {
      const validateRegisterEntitiesSchema = new SchemaValidator(RegisterEntityDTO, req.body)
      validateRegisterEntitiesSchema.exec()

      const registerEntity = new RegisterEntityUseCase(this.repository)
      const entity = await registerEntity.exec(req.body)

      HandleHTTPResponse.Created(res, 'Entity registered successfully', { id: entity.id })
    } catch (error) {
      res.status(500).send(error)
    }
  }

  async update(
    req: FastifyRequest<{ Body: { description: string }; Params: Record<string, string> }>,
    res: FastifyReply
  ): Promise<void> {
    try {
      const id = GetURLParams(req, 'id')
      const validateIDSchema = new SchemaValidator(CheckIdDTO, { id })
      validateIDSchema.exec()

      const schemaValidator = new SchemaValidator(UpdateEntityDTO, req.body)
      schemaValidator.exec()

      const updateEntity = new UpdateEntityUseCase(this.repository)
      await updateEntity.exec(id, req.body)

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

  async login(req: FastifyRequest<{ Body: EntityLoginPayload }>, rep: FastifyReply): Promise<void> {
    try {
      const login = new LoginEntityUseCase(this.repository)
      const entity = await login.exec(req.body)

      const authService = new AuthService(this.jwtStrategy)
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
      const tokenEntity = req.entity as { name: string; email: string; role: string }

      const findByEmail = new FindByEmailUseCase(this.repository)
      const entity = await findByEmail.exec(tokenEntity.email)

      const authService = new AuthService(this.jwtStrategy)
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
