import { type FastifyReply, type FastifyRequest } from 'fastify'
import AuthService from '../../../auth/application/service/auth.service'
import { Roles } from '../../../auth/domain/entities/role'
import type IJWTStrategy from '../../../auth/domain/strategies/jwt.interface.strategy'
import CheckIdDTO from '../../../shared/infrastructure/dto-types/check-id.dto'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import { getPaginationParams, getURLParams } from '../../../shared/utils/http.request.util'
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
import EntitySchemaValidator from '../middlewares/zod-schema-validator.middleware'

class EntityHandler {
  constructor(
    private readonly repository: EntityRepository,
    private readonly jwtStrategy: IJWTStrategy
  ) {}

  async list(req: FastifyRequest<{ Querystring: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const { offset, limit } = getPaginationParams(req)

    const listEntities = new ListEntitiesUseCase(this.repository)
    const entities = await listEntities.exec(offset, limit)

    HandleHTTPResponse.OK(rep, 'Entities retrieved successfully', entities)
  }

  async findByID(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const validateIDSchema = new EntitySchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const findEntity = new FindEntityByIDUseCase(this.repository)
    const entity = await findEntity.exec(id)

    HandleHTTPResponse.OK(rep, 'Entity retrieved successfully', entity)
  }

  async findAndPopulate(req: FastifyRequest<{ Params: Record<string, string> }>, rep: FastifyReply): Promise<void> {
    const params = EntityQueryParams.parse(req.query)

    const findWithPopulate = new FindEntityWithPopulateUseCase(this.repository)
    const entity = await findWithPopulate.exec(params.id, params.with)

    HandleHTTPResponse.OK(rep, 'Entity retrieved successfully', entity)
  }

  async register(req: FastifyRequest<{ Body: EntityPayload }>, rep: FastifyReply): Promise<void> {
    const validateRegisterEntitiesSchema = new EntitySchemaValidator(RegisterEntityDTO, req.body)
    validateRegisterEntitiesSchema.exec()

    const registerEntity = new RegisterEntityUseCase(this.repository)
    const entity = await registerEntity.exec(req.body)

    HandleHTTPResponse.Created(rep, 'Entity registered successfully', { id: entity.id })
  }

  async update(
    req: FastifyRequest<{ Body: { description: string }; Params: Record<string, string> }>,
    rep: FastifyReply
  ): Promise<void> {
    const id = getURLParams(req, 'id')
    const validateIDSchema = new EntitySchemaValidator(CheckIdDTO, { id })
    validateIDSchema.exec()

    const schemaValidator = new EntitySchemaValidator(UpdateEntityDTO, req.body)
    schemaValidator.exec()

    const updateEntity = new UpdateEntityUseCase(this.repository)
    await updateEntity.exec(id, req.body)

    HandleHTTPResponse.OK(rep, 'Entity updated successfully', { id })
  }

  async delete(req: FastifyRequest<{ Params: { id: string } }>, rep: FastifyReply): Promise<void> {
    const id = getURLParams(req, 'id')

    const schemaValidator = new EntitySchemaValidator(CheckIdDTO, { id })
    schemaValidator.exec()

    const deleteEntity = new DeleteEntityUseCase(this.repository)
    await deleteEntity.exec(id)

    HandleHTTPResponse.OK(rep, 'Entity deleted successfully', { id })
  }

  async login(req: FastifyRequest<{ Body: EntityLoginPayload }>, rep: FastifyReply): Promise<void> {
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
  }

  async refreshToken(req: FastifyRequest, rep: FastifyReply): Promise<void> {
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
  }

  async validateRole(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const tokenEntity = req.tokenRole
    if (tokenEntity !== Roles.ENTITY) {
      throw new Error('Invalid role')
    }
    HandleHTTPResponse.OK(rep, 'Token checked successfully', { isValid: true })
  }
}

export default EntityHandler
