export const listSchema = {
  description: 'Get list of entities',
  tags: ['entity'],
  summary: 'Get entities',
  response: {
    200: {
      description: 'Successful response',
      type: 'array',
      items: { $ref: 'Entity#' }
    }
  }
}

export const findByIDSchema = {
  description: 'Get entity by ID',
  tags: ['entity'],
  summary: 'Get entity by ID',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  },
  response: {
    200: {
      description: 'Successful response',
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' }
      }
    }
  }
}
