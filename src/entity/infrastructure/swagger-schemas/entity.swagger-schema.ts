export const listSwaggerSchema = {
  description: 'This is an endpoint that retrieves a list of entities by pagination.',
  tags: ['Entity'],
  querystring: {
    type: 'object',
    properties: {
      offset: { type: 'integer', description: 'Offset for pagination' },
      limit: { type: 'integer', description: 'Limit for pagination' }
    },
    required: ['offset', 'limit']
  },
  response: {
    200: {
      description: 'Entities retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', description: 'Unique identifier for the Entity.' },
              createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
              name: { type: 'string', description: 'Name of the entity.' },
              description: { type: 'string', description: 'Description of the entity.' },
              city: { type: 'string', description: 'City of the entity.' },
              province: { type: 'string', description: 'Province of the entity.' }
            },
            required: ['id', 'createdAt', 'updatedAt', 'name', 'description', 'city', 'province']
          }
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const findByIdSwaggerSchema = {
  description: 'This is an endpoint that retrieves a single entity by ID.',
  tags: ['Entity'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Entity retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
            name: { type: 'string', description: 'Name of the entity.' },
            description: { type: 'string', description: 'Description of the entity.' },
            city: { type: 'string', description: 'City of the entity.' },
            province: { type: 'string', description: 'Province of the entity.' }
          },
          required: ['id', 'createdAt', 'updatedAt', 'name', 'description', 'city', 'province']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const registerSwaggerSchema = {
  description: 'This is an endpoint that register a new entity.',
  tags: ['Entity'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the entity.' },
      description: { type: 'string', description: 'Description of the entity.' },
      password: { type: 'string', description: 'Password of the entity.' },
      city: { type: 'string', description: 'City of the entity.' },
      province: { type: 'string', description: 'Province of the entity.' }
    },
    required: ['name', 'description', 'password', 'city', 'province']
  },
  response: {
    201: {
      description: 'Entity registered successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const updateSwaggerSchema = {
  description: 'This is an endpoint that updates a entity by ID.',
  tags: ['Entity'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      description: { type: 'string', description: 'Description of the entity.' }
    },
    required: ['description']
  },
  response: {
    200: {
      description: 'Entity updated successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const deleteSwaggerSchema = {
  description: 'This is an endpoint that deletes a entity by ID.',
  tags: ['Entity'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Entity deleted successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the entity.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}
