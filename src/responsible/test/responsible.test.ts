/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntity,
  createResponsible,
  createResponsibleWithToken,
  RESPONSIBLE_FIXTURE
} from '../../shared/test/test-helpers'

describe('Responsible — integration tests', () => {
  let entityId: string
  let token: string

  beforeEach(async () => {
    const entity = await createEntity(app)
    entityId = entity.id
    const responsible = await createResponsibleWithToken(app, entityId, { username: 'tokenresp' })
    token = responsible.token
  })

  describe('POST /api/responsible', () => {
    it('crea un responsable vinculado a una entidad existente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible',
        body: { ...RESPONSIBLE_FIXTURE, username: 'nuevoresp', email: 'nuevoresp@test.com', dni: 30000001, entityId }
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().data.id).toBeDefined()
    })

    it('devuelve 404 con entityId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible',
        body: {
          ...RESPONSIBLE_FIXTURE,
          username: 'noentresp',
          email: 'noentresp@test.com',
          dni: 30000002,
          entityId: '00000000-0000-0000-0000-000000000000'
        }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 409 con username duplicado', async () => {
      await createResponsible(app, entityId, { username: 'dupresp', email: 'dupresp@test.com', dni: 30000003 })
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible',
        body: { ...RESPONSIBLE_FIXTURE, username: 'dupresp', email: 'dupresp2@test.com', dni: 30000004, entityId }
      })
      expect(res.statusCode).toBe(409)
    })

    it('el responsable aparece en la entidad al popular', async () => {
      await createResponsible(app, entityId, { username: 'populate', email: 'populate@test.com', dni: 30000005 })
      const res = await app.inject({ method: 'GET', url: `/api/entity/populate?id=${entityId}&with=responsible` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.responsible.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/responsible/:id', () => {
    it('obtiene un responsable por id', async () => {
      const responsible = await createResponsible(app, entityId, {
        email: 'buscar@test.com',
        dni: 30000006,
        username: 'buscarresp'
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/responsible/${responsible.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.username).toBe('buscarresp')
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/responsible/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/responsible', () => {
    it('lista responsables con paginación', async () => {
      await createResponsible(app, entityId, { email: 'lista@test.com', dni: 30000007, username: 'listaresp' })
      const res = await app.inject({
        method: 'GET',
        url: '/api/responsible?offset=0&limit=10',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('PUT /api/responsible/:id', () => {
    it('actualiza el teléfono del responsable', async () => {
      const responsible = await createResponsible(app, entityId, {
        email: 'actualizar@test.com',
        dni: 30000008,
        username: 'actualizarresp'
      })
      const res = await app.inject({
        method: 'PUT',
        url: `/api/responsible/${responsible.id}`,
        headers: { authorization: `Bearer ${token}` },
        body: { phoneNumber: '3534999999' }
      })
      expect(res.statusCode).toBe(200)
    })

    it('devuelve 404 al actualizar id inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/responsible/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
        body: { phoneNumber: '3534999999' }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/responsible/:id', () => {
    it('elimina un responsable existente', async () => {
      const responsible = await createResponsible(app, entityId, {
        email: 'aborrar@test.com',
        dni: 30000009,
        username: 'aborrarresp'
      })
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/responsible/${responsible.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
    })

    it('el GET devuelve 404 luego del DELETE', async () => {
      const responsible = await createResponsible(app, entityId, {
        email: 'aborrar2@test.com',
        dni: 30000010,
        username: 'aborrar2resp'
      })
      await app.inject({
        method: 'DELETE',
        url: `/api/responsible/${responsible.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/responsible/${responsible.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('POST /api/responsible/auth/login', () => {
    it('hace login con credenciales válidas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible/auth/login',
        body: { email: RESPONSIBLE_FIXTURE.email, password: RESPONSIBLE_FIXTURE.password }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveProperty('accessToken')
    })

    it('devuelve 401 con password incorrecta', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/responsible/auth/login',
        body: { email: RESPONSIBLE_FIXTURE.email, password: 'WrongPass123@' }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
