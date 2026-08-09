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
  const statusCode = error.statusCode ?? (typeof domainCode === 'number' ? domainCode : undefined) ?? 400
  const patchedError = Object.assign(error, { statusCode })

  const { message, code, stack } = ErrorFactory.create(patchedError)
  // Solo lo que es realmente un error de servidor va a stderr con stack.
  // Credenciales inválidas, validaciones, 404, etc. son parte del flujo
  // normal de la app (y de sus tests) — loguearlos como error genera ruido
  // y hace parecer que algo se rompió cuando no es así.
  if (code >= 500) {
    console.error('\x1b[0;31m' + stack)
  }
  res.status(code).send({ code, message })
}

export default errorMiddleware
