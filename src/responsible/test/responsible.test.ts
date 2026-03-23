/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import { createEntity, createResponsible, RESPONSIBLE_FIXTURE } from '../../shared/test/test-helpers'

describe('Responsible — integration tests', () => {
  let entityId: string

  beforeEach(async () => {
    const entity = await createEntity(app)
    entityId = entity.id
  })

  describe('POST /api/responsible', () => {
    it('crea un responsable vinculado a una entidad existente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible',
        body: { ...RESPONSIBLE_FIXTURE, entityId }
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().data.username).toBe(RESPONSIBLE_FIXTURE.username)
    })

    it('devuelve 404 con entityId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible',
        body: { ...RESPONSIBLE_FIXTURE, entityId: '00000000-0000-0000-0000-000000000000' }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 409 con username duplicado', async () => {
      await createResponsible(app, entityId)
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible',
        body: { ...RESPONSIBLE_FIXTURE, email: 'otro@test.com', entityId }
      })
      expect(res.statusCode).toBe(409)
    })

    it('el responsable aparece en la entidad al popular', async () => {
      await createResponsible(app, entityId)
      const res = await app.inject({ method: 'GET', url: `/api/entity/populate?id=${entityId}&with=responsible` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.responsible.length).toBe(1)
    })
  })

  describe('GET /api/responsible/:id', () => {
    it('obtiene un responsable por id', async () => {
      const responsible = await createResponsible(app, entityId)
      const res = await app.inject({ method: 'GET', url: `/api/responsible/${responsible.id}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.username).toBe(RESPONSIBLE_FIXTURE.username)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/responsible/00000000-0000-0000-0000-000000000000' })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/responsible', () => {
    it('lista responsables con paginación', async () => {
      await createResponsible(app, entityId)
      await createResponsible(app, entityId, { username: 'otro', email: 'otro@test.com', dni: 28456780 })
      const res = await app.inject({ method: 'GET', url: '/api/responsible?offset=0&limit=10' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(2)
    })
  })

  describe('PUT /api/responsible/:id', () => {
    it('actualiza el teléfono del responsable', async () => {
      const responsible = await createResponsible(app, entityId)
      const res = await app.inject({
        method: 'PUT',
        url: `/api/responsible/${responsible.id}`,
        body: { phoneNumber: '3534999999' }
      })
      expect(res.statusCode).toBe(200)
    })

    it('devuelve 404 al actualizar id inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/responsible/00000000-0000-0000-0000-000000000000',
        body: { phoneNumber: '3534999999' }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/responsible/:id', () => {
    it('elimina un responsable existente', async () => {
      const responsible = await createResponsible(app, entityId)
      const res = await app.inject({ method: 'DELETE', url: `/api/responsible/${responsible.id}` })
      expect(res.statusCode).toBe(200)
    })

    it('el GET devuelve 404 luego del DELETE', async () => {
      const responsible = await createResponsible(app, entityId)
      await app.inject({ method: 'DELETE', url: `/api/responsible/${responsible.id}` })
      const res = await app.inject({ method: 'GET', url: `/api/responsible/${responsible.id}` })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('POST /api/responsible/auth/login', () => {
    it('hace login con credenciales válidas', async () => {
      await createResponsible(app, entityId)
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible/auth/login',
        body: { email: RESPONSIBLE_FIXTURE.email, password: RESPONSIBLE_FIXTURE.password }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveProperty('accessToken')
    })

    it('devuelve 401 con password incorrecta', async () => {
      await createResponsible(app, entityId)
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible/auth/login',
        body: { email: RESPONSIBLE_FIXTURE.email, password: 'WrongPass123@' }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
