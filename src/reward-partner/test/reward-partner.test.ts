/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntityWithToken,
  createRewardPartner,
  createRewardPartnerWithToken,
  REWARD_PARTNER_FIXTURE
} from '../../shared/test/test-helpers'

describe('RewardPartner — integration tests', () => {
  let entityId: string
  let entityToken: string
  let token: string

  beforeEach(async () => {
    const entity = await createEntityWithToken(app)
    entityId = entity.id
    entityToken = entity.token
    const partner = await createRewardPartnerWithToken(app, entityId, entityToken, {
      username: 'tokenpart',
      email: 'tokenpart@test.com',
      name: 'Token Local',
      cuit: '27224445556',
      coordinates: { latitude: -32.405, longitude: -63.238 }
    })
    token = partner.token
  })

  describe('POST /api/reward-partner', () => {
    it('crea un local adherido vinculado a una entidad existente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner',
        headers: { authorization: `Bearer ${entityToken}` },
        body: {
          ...REWARD_PARTNER_FIXTURE,
          username: 'nuevopart',
          email: 'nuevopart@test.com',
          name: 'Nuevo Local',
          entityId,
          cuit: '20123456789',
          coordinates: { latitude: -32.41, longitude: -63.24 }
        }
      })
      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.data.id).toBeTruthy()
      expect(body.data).toHaveProperty('accessToken')
    })

    it('devuelve 401 sin token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner',
        body: { ...REWARD_PARTNER_FIXTURE, entityId }
      })
      expect(res.statusCode).toBe(401)
    })

    it('devuelve 404 con entityId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner',
        headers: { authorization: `Bearer ${entityToken}` },
        body: {
          ...REWARD_PARTNER_FIXTURE,
          username: 'noentpart',
          email: 'noentpart@test.com',
          name: 'No Ent Local',
          entityId: '00000000-0000-0000-0000-000000000000',
          cuit: '20234567891',
          coordinates: { latitude: -32.415, longitude: -63.245 }
        }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 409 con CUIT duplicado', async () => {
      await createRewardPartner(
        app,
        entityId,
        {
          username: 'duppart',
          email: 'duppart@test.com',
          name: 'Dup Local',
          cuit: '20345678912',
          coordinates: { latitude: -32.42, longitude: -63.25 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner',
        headers: { authorization: `Bearer ${entityToken}` },
        body: {
          ...REWARD_PARTNER_FIXTURE,
          username: 'duppart2',
          email: 'duppart2@test.com',
          name: 'Dup Local 2',
          entityId,
          cuit: '20345678912',
          coordinates: { latitude: -32.425, longitude: -63.255 }
        }
      })
      expect(res.statusCode).toBe(409)
    })

    it('devuelve 400 con CUIT con formato inválido', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner',
        headers: { authorization: `Bearer ${entityToken}` },
        body: {
          ...REWARD_PARTNER_FIXTURE,
          username: 'cuitpart',
          email: 'cuitpart@test.com',
          name: 'Cuit Local',
          entityId,
          cuit: '123',
          coordinates: { latitude: -32.43, longitude: -63.26 }
        }
      })
      expect(res.statusCode).toBe(400)
    })

    it('el local aparece en la entidad al popular', async () => {
      await createRewardPartner(
        app,
        entityId,
        {
          username: 'poppart',
          email: 'poppart@test.com',
          name: 'Pop Local',
          cuit: '20456789123',
          coordinates: { latitude: -32.435, longitude: -63.265 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'GET',
        url: `/api/entity/populate?id=${entityId}&with=rewardPartners`,
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.rewardPartners.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('GET /api/reward-partner/:id', () => {
    it('obtiene un local por id', async () => {
      const partner = await createRewardPartner(
        app,
        entityId,
        {
          username: 'buscarpart',
          email: 'buscarpart@test.com',
          name: 'Buscar Local',
          cuit: '20567891234',
          coordinates: { latitude: -32.44, longitude: -63.27 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'GET',
        url: `/api/reward-partner/${partner.id}`,
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.name).toBe('Buscar Local')
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/reward-partner/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/reward-partner', () => {
    it('lista locales con paginación', async () => {
      await createRewardPartner(
        app,
        entityId,
        {
          username: 'listapart',
          email: 'listapart@test.com',
          name: 'Lista Local',
          cuit: '20678912345',
          coordinates: { latitude: -32.445, longitude: -63.275 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'GET',
        url: '/api/reward-partner?offset=0&limit=10',
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('PUT /api/reward-partner/:id', () => {
    it('actualiza datos del local (con su propio token)', async () => {
      // protectOwner('id', REWARD_PARTNER): solo el propio local puede actualizarse.
      const partner = await createRewardPartnerWithToken(app, entityId, entityToken, {
        username: 'updatepart',
        email: 'updatepart@test.com',
        name: 'Update Local',
        cuit: '20789123456',
        coordinates: { latitude: -32.45, longitude: -63.28 }
      })
      const res = await app.inject({
        method: 'PUT',
        url: `/api/reward-partner/${partner.id}`,
        headers: { authorization: `Bearer ${partner.token}` },
        body: { name: 'Nombre Actualizado', address: 'Nueva Direccion 456' }
      })
      expect(res.statusCode).toBe(200)
    })
  })

  describe('DELETE /api/reward-partner/:id', () => {
    it('elimina un local existente (con token de entidad)', async () => {
      // DELETE /api/reward-partner/:id está protegido con protect(ENTITY).
      const partner = await createRewardPartner(
        app,
        entityId,
        {
          username: 'deletepart',
          email: 'deletepart@test.com',
          name: 'Delete Local',
          cuit: '20891234567',
          coordinates: { latitude: -32.455, longitude: -63.285 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/reward-partner/${partner.id}`,
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(res.statusCode).toBe(200)
    })
  })

  describe('POST /api/reward-partner/auth/login', () => {
    it('hace login con credenciales válidas', async () => {
      await createRewardPartner(
        app,
        entityId,
        {
          username: 'loginpart',
          email: 'loginpart@test.com',
          name: 'Login Local',
          cuit: '20912345678',
          coordinates: { latitude: -32.46, longitude: -63.29 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner/auth/login',
        body: { email: 'loginpart@test.com', password: REWARD_PARTNER_FIXTURE.password }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data).toHaveProperty('accessToken')
    })

    it('devuelve 401 con password incorrecta', async () => {
      await createRewardPartner(
        app,
        entityId,
        {
          username: 'wrongpasspart',
          email: 'wrongpasspart@test.com',
          name: 'Wrong Local',
          cuit: '21023456789',
          coordinates: { latitude: -32.465, longitude: -63.295 }
        },
        entityToken
      )
      const res = await app.inject({
        method: 'POST',
        url: '/api/reward-partner/auth/login',
        body: { email: 'wrongpasspart@test.com', password: 'WrongPass123@' }
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
