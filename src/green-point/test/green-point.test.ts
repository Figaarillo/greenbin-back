/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import { createEntityWithToken, createGreenPoint, GREEN_POINT_FIXTURE } from '../../shared/test/test-helpers'

describe('GreenPoint — integration tests', () => {
  let entityId: string
  let token: string

  beforeEach(async () => {
    const entity = await createEntityWithToken(app)
    entityId = entity.id
    token = entity.token
  })

  describe('POST /api/green-point', () => {
    it('crea un punto verde vinculado a una entidad existente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/green-point',
        headers: { authorization: `Bearer ${token}` },
        body: { ...GREEN_POINT_FIXTURE, entityId }
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().data.id).toBeTruthy()
    })

    it('devuelve 401 sin token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/green-point',
        body: { ...GREEN_POINT_FIXTURE, entityId }
      })
      expect(res.statusCode).toBe(401)
    })

    it('devuelve 404 con entityId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/green-point',
        headers: { authorization: `Bearer ${token}` },
        body: { ...GREEN_POINT_FIXTURE, entityId: '00000000-0000-0000-0000-000000000000' }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 409 con coordenadas duplicadas', async () => {
      await createGreenPoint(app, entityId, {}, token)
      const res = await app.inject({
        method: 'POST',
        url: '/api/green-point',
        headers: { authorization: `Bearer ${token}` },
        body: { ...GREEN_POINT_FIXTURE, name: 'Otro Punto', email: 'otro@test.com', entityId }
      })
      expect(res.statusCode).toBe(409)
    })

    it('el punto verde aparece en la entidad al popular', async () => {
      await createGreenPoint(app, entityId, {}, token)
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/populate?id=${entityId}&with=greenPoints`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.greenPoints.length).toBe(1)
    })
  })

  describe('GET /api/green-point/:id', () => {
    it('obtiene un punto verde por id', async () => {
      const gp = await createGreenPoint(app, entityId, {}, token)
      const res = await app.inject({
        method: 'GET',
        url: `/api/green-point/${gp.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.name).toBe(GREEN_POINT_FIXTURE.name)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/green-point/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/green-point', () => {
    it('lista puntos verdes con paginación', async () => {
      await createGreenPoint(app, entityId, {}, token)
      await createGreenPoint(
        app,
        entityId,
        {
          name: 'Punto Verde 2',
          email: 'pv2@test.com',
          coordinates: { latitude: -32.41, longitude: -63.25 }
        },
        token
      )
      const res = await app.inject({
        method: 'GET',
        url: '/api/green-point?offset=0&limit=10',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(2)
    })
  })

  describe('PUT /api/green-point/:id', () => {
    it('actualiza datos del punto verde', async () => {
      const gp = await createGreenPoint(app, entityId, {}, token)
      const res = await app.inject({
        method: 'PUT',
        url: `/api/green-point/${gp.id}`,
        headers: { authorization: `Bearer ${token}` },
        body: { description: 'Descripción actualizada del punto verde' }
      })
      expect(res.statusCode).toBe(200)
    })

    it('devuelve 404 al actualizar id inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/green-point/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
        body: { description: 'x' }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/green-point/:id', () => {
    it('elimina un punto verde existente', async () => {
      const gp = await createGreenPoint(app, entityId, {}, token)
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/green-point/${gp.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
    })

    it('el GET devuelve 404 luego del DELETE', async () => {
      const gp = await createGreenPoint(app, entityId, {}, token)
      await app.inject({
        method: 'DELETE',
        url: `/api/green-point/${gp.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/green-point/${gp.id}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })
})
