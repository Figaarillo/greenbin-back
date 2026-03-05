import { type FastifyRequest } from 'fastify'
import ErrorHeader from '../domain/errors/header.error'
import ErrorLimitParameter from '../domain/errors/limit-parameter.error'
import ErrorOffsetParameter from '../domain/errors/offset-parameter.error'
import ErrorQueryParamMissing from '../domain/errors/query-params.error'
import ErrorURLParams from '../domain/errors/url-param.error'

export interface PaginationParams {
  offset: number
  limit: number
}

export function getURLQueryParam(
  req: FastifyRequest<{ Querystring: Record<string, string> }>,
  propKey: string
): string {
  const propValue = req.query[propKey]
  if (propValue === '') {
    throw new ErrorQueryParamMissing(propKey)
  }

  return propValue
}

export function getPaginationParams(req: FastifyRequest<{ Querystring: Record<string, string> }>): PaginationParams {
  const offset = parseInt(getURLQueryParam(req, 'offset'))
  if (!Number.isNaN(offset) && offset < 0) {
    throw new ErrorOffsetParameter()
  }

  const limit = parseInt(getURLQueryParam(req, 'limit'))
  if (!Number.isNaN(limit) && limit < 1) {
    throw new ErrorLimitParameter()
  }

  return { offset, limit }
}

export function getURLParams(req: FastifyRequest<{ Params: Record<string, string> }>, key: string): string {
  const value = req.params[key]
  if (value === '' || value == null) {
    throw new ErrorURLParams(key)
  }

  return value
}

export function getHeader(req: FastifyRequest, key: string): string {
  const value = req.headers[key]
  if (value === '' || value == null || value === undefined) {
    throw new ErrorHeader(key)
  }

  if (typeof value === 'object') {
    return value.toString()
  }

  return value
}
