export const registerSwaggerSchema = {
  description: 'This is an endpoint that register a new neighbor.',
  tags: ['Neighbor'],
  body: {
    type: 'object',
    properties: {
      firstname: { type: 'string', description: 'Firstname of the neighbor.' },
      lastname: { type: 'string', description: 'Lastname of the neighbor.' },
      username: { type: 'string', description: 'Username of the neighbor.' },
      email: { type: 'string', description: 'Email of the neighbor.' },
      password: { type: 'string', description: 'Password of the neighbor.' },
      dni: { type: 'number', description: 'DNI of the neighbor.' },
      phoneNumber: { type: 'string', description: 'Phone number of the neighbor.' },
      birthdate: { type: 'string', description: 'Birthdate of the neighbor.' }
    },
    required: ['firstname', 'lastname', 'username', 'email', 'password', 'dni', 'phoneNumber', 'birthdate']
  },
  response: {
    201: {
      description: 'Neighbor registered successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the neighbor.' },
            accessToken: { type: 'string', description: 'Access token of the neighbor.' },
            refreshToken: { type: 'string', description: 'Refresh token of the neighbor.' }
          },
          required: ['id', 'accessToken', 'refreshToken']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const updateSwaggerSchema = {
  description: 'This is an endpoint that updates a neighbor by ID.',
  tags: ['Neighbor'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the neighbor.' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      firstname: { type: 'string', description: 'Firstname of the neighbor.' },
      lastname: { type: 'string', description: 'Lastname of the neighbor.' },
      username: { type: 'string', description: 'Username of the neighbor.' },
      email: { type: 'string', description: 'Email of the neighbor.' },
      phoneNumber: { type: 'string', description: 'Phone number of the neighbor.' }
    },
    required: ['firstname', 'lastname', 'email', 'username', 'phoneNumber']
  },
  response: {
    200: {
      description: 'Neighbor updated successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the neigbhor.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}
