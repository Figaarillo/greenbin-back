import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteCategoryHandler from '../handlers/waste-category.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/waste-category.swagger-schema'

class WasteCategoryRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: WasteCategoryHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/waste-category',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.List(req, res)
      }
    )
    this.server.get(
      '/api/waste-category/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.FindByID(req, res)
      }
    )
    this.server.post('/api/waste-category', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.Register(req, res)
    })
    this.server.put(
      '/api/waste-category/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.Update(req, res)
      }
    )
    this.server.delete(
      '/api/waste-category/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.Delete(req, res)
      }
    )
  }
}

export default WasteCategoryRoute
