export const listSwaggerSchema = {
  description: 'This is an endpoint that retrieves a list of green points by pagination.',
  tags: ['GreenPoint'],
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
      description: 'Green points retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', description: 'Unique identifier for the green point.' },
              createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
              name: { type: 'string', description: 'Name of the GreenPoint.' },
              description: { type: 'string', description: 'Description of the green point.' },
              address: { type: 'string', description: 'Address of the green point.' },
              coordinates: {
                type: 'object',
                properties: {
                  latitude: { type: 'number', description: 'Latitude of the green point.' },
                  longitude: { type: 'number', description: 'Longitude of the Green point.' }
                },
                required: ['latitude', 'longitude']
              }
            },
            required: ['id', 'createdAt', 'updatedAt', 'name', 'description', 'address', 'coordinates']
          }
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const findByIdSwaggerSchema = {
  description: 'This is an endpoint that retrieves a single green point by ID.',
  tags: ['GreenPoint'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the green point.' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Green point retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the green point.' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
            name: { type: 'string', description: 'Name of the GreenPoint.' },
            description: { type: 'string', description: 'Description of the GreenPoint.' },
            address: { type: 'string', description: 'Address of the green point.' },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number', description: 'Latitude of the green point.' },
                longitude: { type: 'number', description: 'Longitude of the Green point.' }
              },
              required: ['latitude', 'longitude']
            }
          },
          required: ['id', 'createdAt', 'updatedAt', 'name', 'description', 'address', 'coordinates']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const registerSwaggerSchema = {
  description: 'This is an endpoint that register a new green point.',
  tags: ['GreenPoint'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the green point.' },
      description: { type: 'string', description: 'Description of the green point.' },
      address: { type: 'string', description: 'Address of the green point.' },
      coordinates: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'Latitude of the green point.' },
          longitude: { type: 'number', description: 'Longitude of the Green point.' }
        },
        required: ['latitude', 'longitude']
      }
    },
    required: ['name', 'description', 'address', 'coordinates']
  },
  response: {
    201: {
      description: 'Green point registered successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the green point.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const updateSwaggerSchema = {
  description: 'This is an endpoint that updates a green point by ID.',
  tags: ['GreenPoint'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the green point.' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the green point.' },
      description: { type: 'string', description: 'Description of the green point.' }
    },
    required: ['name', 'description']
  },
  response: {
    200: {
      description: 'Green point updated successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the green point.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const deleteSwaggerSchema = {
  description: 'This is an endpoint that deletes a green point by ID.',
  tags: ['GreenPoint'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the GreenPoint.' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Green point deleted successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the GreenPoint.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}
