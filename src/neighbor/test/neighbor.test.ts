/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntity,
  createNeighbor,
  createNeighborWithToken,
  createWasteCategory,
  createResponsible,
  createGreenPoint,
  NEIGHBOR_FIXTURE
} from '../../shared/test/test-helpers'

describe('Neighbor — integration tests', () => {
  let entityId: string
  let token: string

  beforeEach(async () => {
    const entity = await createEntity(app)
    entityId = entity.id
    const neighbor = await createNeighborWithToken(app, entityId)
    token = neighbor.token
  })

  describe('POST /api/neighbor', () => {
    it('crea un vecino vinculado a una entidad existente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor',
        body: { ...NEIGHBOR_FIXTURE, username: 'nuevo', email: 'nuevo@test.com', dni: 30000099, entityId }
      })
      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.data.id).toBeTruthy()
      expect(body.data).toHaveProperty('accessToken')
    })

    it('devuelve 404 con entityId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor',
        body: {
          ...NEIGHBOR_FIXTURE,
          username: 'nuevo2',
          email: 'nuevo2@test.com',
          dni: 30000098,
          entityId: '00000000-0000-0000-0000-000000000000'
        }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 409 con username duplicado', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor',
        body: { ...NEIGHBOR_FIXTURE, email: 'otro@test.com', entityId }
      })
      expect(res.statusCode).toBe(409)
    })

    it('devuelve 409 con email duplicado', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor',
        body: { ...NEIGHBOR_FIXTURE, username: 'otrousuario', entityId }
      })
      expect(res.statusCode).toBe(409)
    })

    it('devuelve 400 con fecha de nacimiento inválida', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor',
        body: {
          ...NEIGHBOR_FIXTURE,
          username: 'nuevo3',
          email: 'nuevo3@test.com',
          dni: 30000097,
          birthdate: '1990-05-14',
          entityId
        }
      })
      expect(res.statusCode).toBe(400)
    })

    it('el vecino aparece en la entidad al popular', async () => {
      const res = await app.inject({ method: 'GET', url: `/api/entity/populate?id=${entityId}&with=neighbors` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.neighbors.length).toBe(1)
    })
  })

  describe('GET /api/neighbor/:id', () => {
    it('obtiene un vecino por id', async () => {
      const neighbor = await createNeighbor(app, entityId, {
        username: 'buscar',
        email: 'buscar@test.com',
        dni: 30000003
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/neighbor/${neighbor.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.username).toBe('buscar')
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/neighbor/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 401 sin token', async () => {
      const neighbor = await createNeighbor(app, entityId, {
        username: 'buscar2',
        email: 'buscar2@test.com',
        dni: 30000004
      })
      const res = await app.inject({ method: 'GET', url: `/api/neighbor/${neighbor.id}` })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/neighbor/dni/:dni', () => {
    it('obtiene un vecino por DNI', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/neighbor/dni/${NEIGHBOR_FIXTURE.dni}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.dni).toBe(NEIGHBOR_FIXTURE.dni)
    })

    it('devuelve 404 con DNI inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/neighbor/dni/99999999',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/neighbor', () => {
    it('lista vecinos con paginación', async () => {
      await createNeighbor(app, entityId, { username: 'otro', email: 'otro@test.com', dni: 30000002 })
      const res = await app.inject({
        method: 'GET',
        url: '/api/neighbor?offset=0&limit=10',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('GET /api/neighbor/get-waste/:id', () => {
    it('devuelve los residuos del vecino (inicialmente vacío con 0 puntos)', async () => {
      const neighbor = await createNeighborWithToken(app, entityId, {
        username: 'sinresiduos',
        email: 'sinresiduos@test.com',
        dni: 30000005
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/neighbor/get-waste/${neighbor.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      const body = res.json().data
      expect(body.points).toBe(0)
      expect(body).toHaveProperty('wastes')
    })

    it('refleja puntos acumulados luego de una transacción de residuos', async () => {
      const neighbor = await createNeighborWithToken(app, entityId, {
        username: 'conresiduos',
        email: 'conresiduos@test.com',
        dni: 30000006
      })
      const responsible = await createResponsible(app, entityId)
      const greenPoint = await createGreenPoint(app, entityId)
      const category = await createWasteCategory(app)

      await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId: responsible.id,
          neighborId: neighbor.id,
          greenPointId: greenPoint.id,
          wastes: [{ categoryId: category.id, weight: 2.0 }]
        }
      })

      const res = await app.inject({
        method: 'GET',
        url: `/api/neighbor/get-waste/${neighbor.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.points).toBeGreaterThan(0)
    })
  })

  describe('PUT /api/neighbor/:id', () => {
    it('actualiza el teléfono del vecino', async () => {
      const neighbor = await createNeighbor(app, entityId, {
        username: 'aactualizar',
        email: 'aactualizar@test.com',
        dni: 30000007
      })
      const res = await app.inject({
        method: 'PUT',
        url: `/api/neighbor/${neighbor.id}`,
        headers: { authorization: `Bearer ${token}` },
        body: { phoneNumber: '3535999999' }
      })
      expect(res.statusCode).toBe(200)
    })

    it('devuelve 404 al actualizar id inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/neighbor/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
        body: { phoneNumber: '3535999999' }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/neighbor/:id', () => {
    it('elimina un vecino existente (soft delete)', async () => {
      const neighbor = await createNeighbor(app, entityId, {
        username: 'aborrar',
        email: 'aborrar@test.com',
        dni: 30000008
      })
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/neighbor/${neighbor.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
    })
    it('devuelve 404 al eliminar id inexistente', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/neighbor/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 401 sin token', async () => {
      const neighbor = await createNeighbor(app, entityId, {
        username: 'aborrar2',
        email: 'aborrar2@test.com',
        dni: 30000009
      })
      const res = await app.inject({ method: 'DELETE', url: `/api/neighbor/${neighbor.id}` })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/neighbor/auth/login', () => {
    it('hace login con credenciales válidas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor/auth/login',
        body: { email: NEIGHBOR_FIXTURE.email, password: NEIGHBOR_FIXTURE.password }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveProperty('accessToken')
    })

    it('devuelve 401 con password incorrecta', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/neighbor/auth/login',
        body: { email: NEIGHBOR_FIXTURE.email, password: 'WrongPass123@' }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
