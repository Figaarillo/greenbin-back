import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type EntityHandler from '../handlers/entity.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/entity.swagger-schema'
import type EntityPayload from '../../domain/payloads/entity.payload'
import type EntityLoginPayload from '../../domain/payloads/entity.login.payload'
import { Roles } from '../../../auth/domain/entities/role'

class EntityRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: EntityHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/entity', {
      schema: listSwaggerSchema,
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })
    this.server.get('/api/entity/:id', {
      schema: findByIdSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.get('/api/entity/populate', async (req: FastifyRequest<{ Params: Record<string, string> }>, rep) => {
      await this.handler.findAndPopulate(req, rep)
    })
    this.server.post(
      '/api/entity',
      { schema: registerSwaggerSchema },
      async (req: FastifyRequest<{ Body: EntityPayload }>, rep) => {
        await this.handler.register(req, rep)
      }
    )
    this.server.put('/api/entity/:id', {
      schema: updateSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Body: { description: string }; Params: { id: string } }>, rep) => {
        await this.handler.update(req, rep)
      }
    })
    this.server.delete('/api/entity/:id', {
      schema: deleteSwaggerSchema,
      preHandler: this.server.auth([this.server.validateAccessToken]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    })
    this.server.post('/api/entity/auth/login', async (req: FastifyRequest<{ Body: EntityLoginPayload }>, rep) => {
      await this.handler.login(req, rep)
    })
    this.server.get('/api/entity/auth/refresh-token', {
      preHandler: this.server.auth([this.server.validateRefreshToken]),
      handler: async (req, rep) => {
        await this.handler.refreshToken(req, rep)
      }
    })
    this.server.get('/api/entity/auth/validate-role', {
      preHandler: this.server.auth([this.server.getTokenRole]),
      handler: async (req, rep) => {
        await this.handler.validateRole(req, rep)
      }
    })
    this.server.get(
      '/api/entity/auth/test-role',
      {
        config: { allowedRoles: [Roles.ENTITY] }
      },
      async (_req, rep) => {
        rep.send('OK')
      }
    )
  }
}

export default EntityRoute
