import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteCategoryHandler from '../handlers/waste-category.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/waste-category.swagger-schema'
import type WasteCategoryPayload from '../../domain/payloads/waste-category.payload'
import { Roles } from '../../../auth/domain/entities/role'

class WasteCategoryRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteCategoryHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/waste-category', {
      schema: listSwaggerSchema,
      preHandler: this.server.auth([
        this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR, Roles.REWARD_PARTNER)
      ]),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })
    this.server.get('/api/waste-category/:id', {
      schema: findByIdSwaggerSchema,
      preHandler: this.server.auth([
        this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR, Roles.REWARD_PARTNER)
      ]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.post('/api/waste-category', {
      schema: registerSwaggerSchema,
      preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
      handler: async (req: FastifyRequest<{ Body: WasteCategoryPayload }>, rep) => {
        await this.handler.register(req, rep)
      }
    })
    this.server.put('/api/waste-category/:id', {
      schema: updateSwaggerSchema,
      preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
      handler: async (req: FastifyRequest<{ Params: { id: string }; Body: WasteCategoryPayload }>, rep) => {
        await this.handler.update(req, rep)
      }
    })
    this.server.delete('/api/waste-category/:id', {
      schema: deleteSwaggerSchema,
      preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    })
  }
}

export default WasteCategoryRoute
