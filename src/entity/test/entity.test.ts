/* eslint-disable no-console */
import { describe, expect, it } from 'vitest'
import { app } from '../../shared/test/test.setup'
import { createEntity, createEntityWithToken, ENTITY_FIXTURE, ENTITY_FIXTURE_2 } from '../../shared/test/test-helpers'

describe('Entity — integration tests', () => {
  describe('POST /api/entity', () => {
    it('crea una entidad correctamente y devuelve su id', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/entity', body: ENTITY_FIXTURE })
      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body).toMatchObject({ message: 'Entity registered successfully' })
      expect(body.data.id).toBeTruthy()
    })

    it('devuelve 409 al crear una entidad con nombre duplicado', async () => {
      await createEntity(app)
      const res = await app.inject({ method: 'POST', url: '/api/entity', body: ENTITY_FIXTURE })
      expect(res.statusCode).toBe(409)
    })

    it('devuelve 409 al crear una entidad con email duplicado', async () => {
      await createEntity(app)
      const res = await app.inject({
        method: 'POST',
        url: '/api/entity',
        body: { ...ENTITY_FIXTURE, name: 'Otro Nombre' }
      })
      expect(res.statusCode).toBe(409)
    })

    it('devuelve 400 con body vacío', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/entity', body: {} })
      expect(res.statusCode).toBe(400)
    })

    it('devuelve 400 con password débil', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/entity',
        body: { ...ENTITY_FIXTURE, password: '123' }
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/entity/:id', () => {
    it('obtiene una entidad por id', async () => {
      const { id, token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.id).toBe(id)
    })

    it('devuelve 404 con id inexistente', async () => {
      const { token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'GET',
        url: '/api/entity/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 401 sin token de autenticación', async () => {
      const entity = await createEntity(app)
      const res = await app.inject({ method: 'GET', url: `/api/entity/${entity.id}` })
      expect(res.statusCode).toBe(401)
    })

    it('devuelve 400 con id con formato inválido', async () => {
      const { token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'GET',
        url: '/api/entity/id-invalido',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/entity', () => {
    it('lista entidades con paginación', async () => {
      const { token } = await createEntityWithToken(app)
      await createEntity(app, ENTITY_FIXTURE_2)
      const res = await app.inject({
        method: 'GET',
        url: '/api/entity?offset=0&limit=10',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBeGreaterThanOrEqual(2)
    })

    it('respeta el límite de paginación', async () => {
      const { token } = await createEntityWithToken(app)
      await createEntity(app, ENTITY_FIXTURE_2)
      const res = await app.inject({
        method: 'GET',
        url: '/api/entity?offset=0&limit=1',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(1)
    })

    it('devuelve 401 sin token', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/entity?offset=0&limit=10' })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/entity/populate', () => {
    it('devuelve la entidad con sus vecinos populados', async () => {
      const { id, token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/populate?id=${id}&with=neighbors`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveProperty('neighbors')
    })

    it('devuelve la entidad con sus puntos verdes populados', async () => {
      const { id, token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/populate?id=${id}&with=greenPoints`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveProperty('greenPoints')
    })
  })

  describe('PUT /api/entity/:id', () => {
    it('actualiza la descripción de una entidad', async () => {
      const { id, token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'PUT',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` },
        body: { description: 'Descripción actualizada' }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ message: 'Entity updated successfully' })
    })

    it('el cambio persiste al hacer un GET posterior', async () => {
      const { id, token } = await createEntityWithToken(app)
      await app.inject({
        method: 'PUT',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` },
        body: { description: 'Nueva descripción' }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.json().data.description).toBe('Nueva descripción')
    })

    it('devuelve 403 al actualizar un id ajeno o inexistente', async () => {
      // protectOwner exige que el sub del token coincida con el :id; otro id (exista o no) es 403.
      const { token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'PUT',
        url: '/api/entity/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
        body: { description: 'x' }
      })
      expect(res.statusCode).toBe(403)
    })

    it('devuelve 401 sin token', async () => {
      const entity = await createEntity(app)
      const res = await app.inject({
        method: 'PUT',
        url: `/api/entity/${entity.id}`,
        body: { description: 'x' }
      })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('DELETE /api/entity/:id', () => {
    it('elimina una entidad existente', async () => {
      const { id, token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ message: 'Entity deleted successfully' })
    })

    it('el GET devuelve 404 luego del DELETE', async () => {
      const { id, token } = await createEntityWithToken(app)
      await app.inject({
        method: 'DELETE',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/${id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 403 al eliminar un id ajeno o inexistente', async () => {
      // protectOwner exige que el sub del token coincida con el :id; otro id (exista o no) es 403.
      const { token } = await createEntityWithToken(app)
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/entity/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(403)
    })

    it('devuelve 401 sin token', async () => {
      const entity = await createEntity(app)
      const res = await app.inject({ method: 'DELETE', url: `/api/entity/${entity.id}` })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('POST /api/entity/auth/login', () => {
    it('hace login con credenciales válidas y devuelve tokens', async () => {
      await createEntity(app)
      const res = await app.inject({
        method: 'POST',
        url: '/api/entity/auth/login',
        body: { email: ENTITY_FIXTURE.email, password: ENTITY_FIXTURE.password }
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().data).toHaveProperty('accessToken')
      expect(res.json().data).toHaveProperty('refreshToken')
    })

    it('devuelve 401 con password incorrecta', async () => {
      await createEntity(app)
      const res = await app.inject({
        method: 'POST',
        url: '/api/entity/auth/login',
        body: { email: ENTITY_FIXTURE.email, password: 'WrongPass123@' }
      })
      expect(res.statusCode).toBe(401)
    })

    it('devuelve 401 con email inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/entity/auth/login',
        body: { email: 'noexiste@test.com', password: 'Test123@#.' }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
