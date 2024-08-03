import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type WasteCategoryHandler from '../handler/waste-category.handler'
import {
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema
} from '../swagger-schemas/waste-category.swagger-schema'

class WasteCategoryRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: WasteCategoryHandler
  ) {}

  setupRoutes(): void {
    this.router.get(
      '/api/waste-category',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, res) => {
        await this.handler.List(req, res)
      }
    )
    this.router.get(
      '/api/waste-category/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
        await this.handler.FindByID(req, res)
      }
    )
    this.router.post('/api/waste-category', { schema: registerSwaggerSchema }, async (req, res) => {
      await this.handler.Register(req, res)
    })
    this.router.put('/api/waste-category/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Update(req, res)
    })
    this.router.delete('/api/waste-category/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Delete(req, res)
    })
  }
}

export default WasteCategoryRoute
