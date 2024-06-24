import { type FastifyInstance } from 'fastify'
import { type DataSource } from 'typeorm'
import type UserRepository from './domain/repository/user.repository'
import UserHandler from './infrastructure/handler/user.handler'
import UserTypeormRepository from './infrastructure/repositories/typeorm/user.typeorm.repository'
import UserRoute from './infrastructure/routes/user.route'

async function BootstrapUser(db: DataSource, router: FastifyInstance): Promise<void> {
  const repository: UserRepository = new UserTypeormRepository(db)

  const handler = new UserHandler(repository)

  const userRoute = new UserRoute(router, handler)
  userRoute.setupRoutes()
}

export default BootstrapUser
