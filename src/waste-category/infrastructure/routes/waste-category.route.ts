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

class WasteCategoryRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteCategoryHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/waste-category',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    )
    this.server.get(
      '/api/waste-category/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    )
    this.server.post(
      '/api/waste-category',
      { schema: registerSwaggerSchema },
      async (req: FastifyRequest<{ Body: WasteCategoryPayload }>, rep) => {
        await this.handler.register(req, rep)
      }
    )
    this.server.put(
      '/api/waste-category/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string }; Body: WasteCategoryPayload }>, rep) => {
        await this.handler.update(req, rep)
      }
    )
    this.server.delete(
      '/api/waste-category/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    )
  }
}

export default WasteCategoryRoute
