import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type GreenPointHandler from '../handlers/green-point.handler'
import {
  deleteSwaggerSchema,
  findByIdSwaggerSchema,
  listSwaggerSchema,
  registerSwaggerSchema,
  updateSwaggerSchema
} from '../swagger-schemas/green-point.swagger-schema'

class GreenPointRoute {
  constructor(
    private readonly server: FastifyInstance,
    private readonly handler: GreenPointHandler
  ) {}

  setupRoutes(): void {
    this.server.get(
      '/api/green-point',
      { schema: listSwaggerSchema },
      async (req: FastifyRequest<{ Querystring: Record<string, string> }>, rep) => {
        await this.handler.list(req, rep)
      }
    )
    this.server.get(
      '/api/green-point/:id',
      { schema: findByIdSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.findByID(req, rep)
      }
    )
    this.server.post('/api/green-point', { schema: registerSwaggerSchema }, async (req, rep) => {
      await this.handler.register(req, rep)
    })
    this.server.put(
      '/api/green-point/:id',
      { schema: updateSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.update(req, rep)
      }
    )
    this.server.delete(
      '/api/green-point/:id',
      { schema: deleteSwaggerSchema },
      async (req: FastifyRequest<{ Params: { id: string } }>, rep) => {
        await this.handler.delete(req, rep)
      }
    )
  }
}

export default GreenPointRoute
