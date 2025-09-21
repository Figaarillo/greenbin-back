import { type FastifyError, type FastifyRequest, type FastifyReply } from 'fastify'
import ErrorFactory from '../../domain/factories/error.factory'

const errorMiddleware: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => void = (
  error,
  _req,
  res
) => {
  const { message, code, stack } = ErrorFactory.create(error)
  console.error('\x1b[0;31m' + stack)
  res.status(code).send({ code, message })
}

export default errorMiddleware
