export const registerSwaggerSchema = {
  description: 'This is an endpoint that register a new reward partner.',
  tags: ['RewardPartner'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the reward partner.' },
      username: { type: 'string', description: 'Username of the reward partner.' },
      address: { type: 'string', description: 'Address of the reward partner.' },
      cuit: { type: 'string', description: 'Cuit of the reward partner.' },
      email: { type: 'string', description: 'Email of the reward partner.' },
      password: { type: 'string', description: 'Password of the reward partner.' },
      phoneNumber: { type: 'string', description: 'Phone number of the reward partner.' }
    },
    required: ['name', 'address', 'cuit', 'email', 'password']
  },
  response: {
    201: {
      description: 'Reward partner registered successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the reward partner.' },
            accessToken: { type: 'string', description: 'Access token of the reward partner.' },
            refreshToken: { type: 'string', description: 'Refresh token of the reward partner.' }
          },
          required: ['id', 'accessToken', 'refreshToken']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}

export const updateSwaggerSchema = {
  description: 'This is an endpoint that updates a reward partner by ID.',
  tags: ['RewardPartner'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Unique identifier for the reward partner.' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Name of the reward partner.' },
      address: { type: 'string', description: 'Address of the reward partner.' },
      email: { type: 'string', description: 'Email of the reward partner.' },
      phoneNumber: { type: 'string', description: 'Phone number of the reward partner.' }
    },
    required: ['name', 'address', 'email']
  },
  response: {
    200: {
      description: 'Reward partner updated successfully',
      type: 'object',
      properties: {
        status: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Unique identifier for the reward partner.' }
          },
          required: ['id']
        }
      },
      required: ['status', 'message', 'data']
    }
  }
}
