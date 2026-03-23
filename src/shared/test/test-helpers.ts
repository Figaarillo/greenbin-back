import { type FastifyInstance } from 'fastify'

// ─── Fixtures ────────────────────────────────────────────────────────────────

export const ENTITY_FIXTURE = {
  name: 'Test Entity',
  email: 'entity@test.com',
  description: 'Test entity description',
  password: 'Test123@#.',
  city: 'Test City',
  province: 'Test Province',
  coordinates: { latitude: -32.4083, longitude: -63.2433 }
}

export const ENTITY_FIXTURE_2 = {
  name: 'Second Entity',
  email: 'entity2@test.com',
  description: 'Second entity description',
  password: 'Test123@#.',
  city: 'Test City',
  province: 'Test Province',
  coordinates: { latitude: -31.4201, longitude: -64.1888 }
}

export const WASTE_CATEGORY_FIXTURE = {
  name: 'Plástico',
  pointsPerWeight: 10,
  description: 'Residuos plásticos reciclables',
  co2: 2.5
}

export const WASTE_CATEGORY_FIXTURE_2 = {
  name: 'Vidrio',
  pointsPerWeight: 6,
  description: 'Botellas y frascos de vidrio',
  co2: 1.2
}

export const NEIGHBOR_FIXTURE = {
  firstname: 'Carlos',
  lastname: 'Garcia',
  username: 'cgarcia',
  email: 'carlos@test.com',
  password: 'Test123@#.',
  dni: 30000001,
  phoneNumber: '3535000001',
  birthdate: '14/05/1990'
}

export const RESPONSIBLE_FIXTURE = {
  firstname: 'Laura',
  lastname: 'Martinez',
  username: 'lmartinez',
  email: 'laura@test.com',
  password: 'Test123@#.',
  dni: 28456789,
  phoneNumber: '3534100001'
}

export const REWARD_PARTNER_FIXTURE = {
  name: 'Supermercado Test',
  username: 'supertest',
  address: 'Av Principal 123',
  cuit: '30693450231',
  email: 'super@test.com',
  password: 'Test123@#.',
  phoneNumber: '3534555001',
  coordinates: { latitude: -32.405, longitude: -63.238 }
}

export const GREEN_POINT_FIXTURE = {
  name: 'Punto Verde Test',
  email: 'greenpoint@test.com',
  phoneNumber: '3534200001',
  description: 'Punto de reciclaje de prueba',
  address: 'Plaza Central s/n',
  coordinates: { latitude: -32.4095, longitude: -63.2442 }
}

export const COUPON_FIXTURE = {
  title: '10% de descuento',
  description: 'Descuento en productos de almacen',
  discount: 10,
  isAvailable: true,
  state: 'AVAILABLE',
  validDays: 30,
  costInPoints: 100
}

// ─── Factory functions ────────────────────────────────────────────────────────

export async function createEntity(app: FastifyInstance, overrides = {}): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/entity',
    body: { ...ENTITY_FIXTURE, ...overrides }
  })
  return res.json().data
}

export async function createEntityWithToken(
  app: FastifyInstance,
  overrides = {}
): Promise<{ id: string; token: string }> {
  const fixture = { ...ENTITY_FIXTURE, ...overrides }
  const created = await createEntity(app, overrides)
  const token = await loginEntity(app, fixture.email, fixture.password)
  return { id: created.id, token }
}

export async function createWasteCategory(app: FastifyInstance, overrides = {}): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/waste-category',
    body: { ...WASTE_CATEGORY_FIXTURE, ...overrides }
  })
  return res.json().data
}

export async function createNeighbor(
  app: FastifyInstance,
  entityId: string,
  overrides = {}
): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/neighbor',
    body: { ...NEIGHBOR_FIXTURE, entityId, ...overrides }
  })
  return res.json().data
}

export async function createNeighborWithToken(
  app: FastifyInstance,
  entityId: string,
  overrides = {}
): Promise<{ id: string; token: string }> {
  const data = await createNeighbor(app, entityId, overrides)
  return { id: data.id, token: data.accessToken }
}

export async function createResponsible(
  app: FastifyInstance,
  entityId: string,
  overrides = {}
): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/responsible',
    body: { ...RESPONSIBLE_FIXTURE, entityId, ...overrides }
  })
  return res.json().data
}

export async function createRewardPartner(
  app: FastifyInstance,
  entityId: string,
  overrides = {}
): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/reward-partner',
    body: { ...REWARD_PARTNER_FIXTURE, entityId, ...overrides }
  })
  return res.json().data
}

export async function createGreenPoint(
  app: FastifyInstance,
  entityId: string,
  overrides = {}
): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/green-point',
    body: { ...GREEN_POINT_FIXTURE, entityId, ...overrides }
  })
  return res.json().data
}

export async function createCoupon(
  app: FastifyInstance,
  rewardPartnerId: string,
  overrides = {}
): Promise<Record<string, string>> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/coupon',
    body: { ...COUPON_FIXTURE, rewardPartnerId, ...overrides }
  })
  return res.json().data
}

export async function loginEntity(app: FastifyInstance, email: string, password: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/entity/auth/login',
    body: { email, password }
  })
  return res.json().data?.accessToken ?? ''
}

export async function loginNeighbor(app: FastifyInstance, email: string, password: string): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/neighbor/auth/login',
    body: { email, password }
  })
  return res.json().data?.accessToken ?? ''
}
