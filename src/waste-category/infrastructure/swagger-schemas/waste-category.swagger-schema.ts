export const listSwaggerSchema = {
  description: 'This is an endpoint that retrieves a list of waste categories by pagination.',
  tags: ['Waste Category'],
  querystring: {
    type: 'object',
    properties: {
      offset: { type: 'integer', description: 'Offset for pagination' },
      limit: { type: 'integer', description: 'Limit for pagination' }
    },
    required: ['limit']
  },
  response: {
    200: {
      description: 'Waste Categories retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Unique identifier for the waste category.' },
              createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
              name: { type: 'string', description: 'Name of the waste category.' },
              description: { type: 'string', description: 'Description of the waste category.' }
            },
            required: ['id', 'createdAt', 'updatedAt', 'name', 'description']
          }
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}
