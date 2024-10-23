import { type FastifyRequest } from 'fastify'

export interface PaginationParams {
  offset: number
  limit: number
}

export function GetURLQueryParam(
  req: FastifyRequest<{ Querystring: Record<string, string> }>,
  propKey: string
): string {
  const propValue = req.query[propKey]
  if (propValue === '') {
    throw new Error(`The query parameter ${propKey} most be not empty string`)
  }

  return propValue
}

export function GetPaginationParams(req: FastifyRequest<{ Querystring: Record<string, string> }>): PaginationParams {
  const offset = parseInt(GetURLQueryParam(req, 'offset'))
  if (!Number.isNaN(offset) && offset <= 0) {
    throw new Error('Offset parameter must be greater than 0')
  }

  const limit = parseInt(GetURLQueryParam(req, 'limit'))
  if (!Number.isNaN(limit) && limit < 1) {
    throw new Error('Limit parameter must be greater than 1')
  }

  return { offset, limit }
}

export function GetURLParams(req: FastifyRequest<{ Params: Record<string, string> }>, key: string): string {
  const value = req.params[key]
  if (value === '' || value == null) {
    throw new Error(`The URL parameter ${key} is required`)
  }

  return value
}

export function GetHeader(req: FastifyRequest, key: string): string {
  const value = req.headers[key]
  if (value === '' || value == null || value === undefined) {
    throw new Error(`The header ${key} is required`)
  }

  if (typeof value === 'object') {
    return value.toString()
  }

  return value
}
