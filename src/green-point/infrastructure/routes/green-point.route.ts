import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type GreenPointHandler from '../handlers/green-point.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/green-point.swagger-schema'
import { Roles } from '../../../auth/domain/entities/role'

class GreenPointRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: GreenPointHandler
  ) {}

  setupRoutes(): void {
    this.server.get('/api/green-point', {
      schema: listSwaggerSchema,
      preHandler: this.server.auth([
        this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR, Roles.REWARD_PARTNER)
      ]),
      handler: async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    })
    this.server.get('/api/green-point/:id', {
      schema: findByIdSwaggerSchema,
      preHandler: this.server.auth([
        this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE, Roles.NEIGHBOR, Roles.REWARD_PARTNER)
      ]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    })
    this.server.post('/api/green-point', {
      schema: registerSwaggerSchema,
      preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
      handler: async (req, rep) => {
        await this.handler.register(req, rep)
      }
    })
    this.server.put('/api/green-point/:id', {
      schema: updateSwaggerSchema,
      preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.update(req, rep)
      }
    })
    this.server.delete('/api/green-point/:id', {
      schema: deleteSwaggerSchema,
      preHandler: this.server.auth([this.server.protect(Roles.ENTITY, Roles.RESPONSIBLE)]),
      handler: async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    })
  }
}

export default GreenPointRoute
