const rewardPartnerProperties = {
  name: { type: 'string', description: 'Name of the reward partner.' },
  username: { type: 'string', description: 'Username of the reward partner.' },
  address: { type: 'string', description: 'Address of the reward partner.' },
  cuit: { type: 'string', description: 'Cuit of the reward partner.' },
  email: { type: 'string', description: 'Email of the reward partner.' },
  password: { type: 'string', description: 'Password of the reward partner.' },
  phoneNumber: { type: 'string', description: 'Phone number of the reward partner.' },
  coordinates: {
    type: 'object',
    properties: {
      latitude: { type: 'number', description: 'Latitude of the green point.' },
      longitude: { type: 'number', description: 'Longitude of the Green point.' }
    },
    required: ['latitude', 'longitude']
  }
}

const baseResponse = {
  status: { type: 'number' },
  message: { type: 'string' }
}

const rewardPartnerResponseData = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Unique identifier for the reward partner.' },
    accessToken: { type: 'string', description: 'Access token of the reward partner.' },
    refreshToken: { type: 'string', description: 'Refresh token of the reward partner.' }
  },
  required: ['id', 'accessToken', 'refreshToken']
}

const rewardPartnerResponse = {
  ...baseResponse,
  data: rewardPartnerResponseData
}

export const registerSwaggerSchema = {
  description: 'This is an endpoint that registers a new reward partner.',
  tags: ['RewardPartner'],
  body: {
    type: 'object',
    properties: {
      ...rewardPartnerProperties
    },
    required: ['name', 'username', 'address', 'cuit', 'email', 'password', 'phoneNumber', 'coordinates']
  },
  response: {
    201: {
      description: 'Reward partner registered successfully',
      type: 'object',
      properties: rewardPartnerResponse,
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
      name: rewardPartnerProperties.name,
      address: rewardPartnerProperties.address,
      email: rewardPartnerProperties.email,
      phoneNumber: rewardPartnerProperties.phoneNumber
    },
    required: ['name', 'address', 'email']
  },
  response: {
    200: {
      description: 'Reward partner updated successfully',
      type: 'object',
      properties: {
        ...baseResponse,
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

export const loginSwaggerSchema = {
  description: 'This is an endpoint that logs in a reward partner.',
  tags: ['RewardPartner'],
  body: {
    type: 'object',
    properties: {
      email: rewardPartnerProperties.email,
      username: rewardPartnerProperties.username,
      password: rewardPartnerProperties.password
    },
    required: ['password']
  },
  response: {
    200: {
      description: 'Reward partner logged in successfully',
      type: 'object',
      properties: rewardPartnerResponse,
      required: ['status', 'message', 'data']
    }
  }
}
