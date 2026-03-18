export const listSwaggerSchema = {
  description: 'This is an endpoint that retrieves a list of responsibles by pagination.',
  tags: ['Responsible'],
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
      description: 'responsibles retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' },
              createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
              firstname: { type: 'string', description: 'Firstname of the responsible.' },
              lastname: { type: 'string', description: 'Lastname of the responsible.' },
              username: { type: 'string', description: 'Username of the responsible.' },
              email: { type: 'string', description: 'Email of the responsible.' },
              dni: { type: 'number', description: 'DNI of the responsible.' },
              phoneNumber: { type: 'string', description: 'Phone number of the responsible.' }
            },
            required: [
              'id',
              'createdAt',
              'updatedAt',
              'firstname',
              'lastname',
              'username',
              'email',
              'dni',
              'phoneNumber'
            ]
          }
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const findByIdSwaggerSchema = {
  description: 'This is an endpoint that retrieves a single responsible by ID.',
  tags: ['Responsible'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Responsible retrieved successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' },
            createdAt: { type: 'string', format: 'date-time', description: 'Creation timestamp.' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp.' },
            firstname: { type: 'string', description: 'Firstname of the responsible.' },
            lastname: { type: 'string', description: 'Lastname of the responsible.' },
            username: { type: 'string', description: 'Username of the responsible.' },
            email: { type: 'string', description: 'Email of the responsible.' },
            dni: { type: 'number', description: 'DNI of the responsible.' },
            phoneNumber: { type: 'string', description: 'Phone number of the responsible.' }
          },
          required: ['id', 'createdAt', 'updatedAt', 'firstname', 'lastname', 'username', 'email', 'dni', 'phoneNumber']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const registerSwaggerSchema = {
  description: 'This is an endpoint that register a new responsible.',
  tags: ['Responsible'],
  body: {
    type: 'object',
    properties: {
      firstname: { type: 'string', description: 'Firstname of the responsible.' },
      lastname: { type: 'string', description: 'Lastname of the responsible.' },
      username: { type: 'string', description: 'Username of the responsible.' },
      email: { type: 'string', description: 'Email of the responsible.' },
      password: { type: 'string', description: 'Password of the responsible.' },
      dni: { type: 'number', description: 'DNI of the responsible.' },
      phoneNumber: { type: 'string', description: 'Phone number of the responsible.' }
    },
    required: ['firstname', 'lastname', 'username', 'email', 'password', 'dni', 'phoneNumber']
  },
  response: {
    201: {
      description: 'Responsible registered successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the Responsible.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const updateSwaggerSchema = {
  description: 'This is an endpoint that updates a responsible by ID.',
  tags: ['Responsible'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      username: { type: 'string', description: 'Username of the responsible.' },
      phoneNumber: { type: 'string', description: 'Phone number of the responsible.' }
    },
    required: ['username', 'phoneNumber']
  },
  response: {
    200: {
      description: 'Responsible updated successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const deleteSwaggerSchema = {
  description: 'This is an endpoint that deletes a responsible by ID.',
  tags: ['Responsible'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' }
    },
    required: ['id']
  },
  response: {
    200: {
      description: 'Responsible deleted successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the responsible.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}
