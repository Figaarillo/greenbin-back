import { type FastifyError, type FastifyRequest, type FastifyReply } from 'fastify'
import { UniqueConstraintViolationException } from '@mikro-orm/core'
import ErrorFactory from '../../domain/factories/error.factory'

const errorMiddleware: (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => void = (
  error,
  _req,
  res
) => {
  if (error instanceof UniqueConstraintViolationException) {
    res.status(409).send({ code: 409, message: 'Resource already exists' })
    return
  }

  const domainCode = (error as unknown as { code?: unknown }).code
  const isHttpStatusCode =
    typeof domainCode === 'number' && Number.isInteger(domainCode) && domainCode >= 100 && domainCode <= 599
  const statusCode = error.statusCode ?? (isHttpStatusCode ? domainCode : 400)
  const patchedError = Object.assign(error, { statusCode })

  const { message, code, stack } = ErrorFactory.create(patchedError)
  console.error('\x1b[0;31m' + stack)
  res.status(code).send({ code, message })
}

export default errorMiddleware
