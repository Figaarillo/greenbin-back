import { type HTTPQueryParams } from '@shared/utils/http.utils'
import { type FastifyInstance, type FastifyRequest } from 'fastify'
import type UserHandler from '../handler/user.handler'

class UserRoute {
  constructor(
    private readonly router: FastifyInstance,
    private readonly handler: UserHandler
  ) {}

  setupRoutes(): void {
    this.router.get('/api/users', async (req: FastifyRequest<{ Querystring: HTTPQueryParams }>, res) => {
      await this.handler.List(req, res)
    })
    this.router.get('/api/users/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.FindByID(req, res)
    })
    this.router.post('/api/users', async (req, res) => {
      await this.handler.Save(req, res)
    })
    this.router.put('/api/users/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Update(req, res)
    })
    this.router.delete('/api/users/:id', async (req: FastifyRequest<{ Params: { id: string } }>, res) => {
      await this.handler.Delete(req, res)
    })
  }
}

export default UserRoute
