import { type FastifyRequest } from 'fastify'

export interface HTTPQueryParams {
  offset: string
  limit: string
}

interface HTTPURLParamsReturn {
  offset: number
  limit: number
}

export function GetURLQueryParams(req: FastifyRequest<{ Querystring: HTTPQueryParams }>): HTTPURLParamsReturn {
  const offset = parseInt(req.query.offset ?? '0')
  const limit = parseInt(req.query.limit ?? '10')

  return {
    offset,
    limit
  }
}

export function GetURLParams(req: FastifyRequest<{ Params: Record<string, string> }>, key: string): string {
  return req.params[key]
}
