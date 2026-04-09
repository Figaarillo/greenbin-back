/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import { createEntity, createRewardPartner, createCoupon, COUPON_FIXTURE } from '../../shared/test/test-helpers'

describe('Coupon — integration tests', () => {
  let rewardPartnerId: string

  beforeEach(async () => {
    const entity = await createEntity(app)
    const partner = await createRewardPartner(app, entity.id)
    rewardPartnerId = partner.id
  })

  describe('POST /api/coupon', () => {
    it('crea un cupón vinculado a un local adherido existente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon',
        body: { ...COUPON_FIXTURE, rewardPartnerId }
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().data.title).toBe(COUPON_FIXTURE.title)
      expect(res.json().data.costInPoints).toBe(COUPON_FIXTURE.costInPoints)
    })

    it('devuelve 404 con rewardPartnerId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon',
        body: { ...COUPON_FIXTURE, rewardPartnerId: '00000000-0000-0000-0000-000000000000' }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 400 con descuento mayor a 100', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon',
        body: { ...COUPON_FIXTURE, discount: 150, rewardPartnerId }
      })
      expect(res.statusCode).toBe(400)
    })

    it('devuelve 400 con costInPoints en 0', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon',
        body: { ...COUPON_FIXTURE, costInPoints: 0, rewardPartnerId }
      })
      expect(res.statusCode).toBe(400)
    })

    it('devuelve 400 con validDays mayor a 365', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon',
        body: { ...COUPON_FIXTURE, validDays: 400, rewardPartnerId }
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/coupon/:id', () => {
    it('obtiene un cupón por id', async () => {
      const coupon = await createCoupon(app, rewardPartnerId)
      const res = await app.inject({ method: 'GET', url: `/api/coupon/${coupon.id}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.title).toBe(COUPON_FIXTURE.title)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/coupon/00000000-0000-0000-0000-000000000000' })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/coupon', () => {
    it('lista todos los cupones', async () => {
      await createCoupon(app, rewardPartnerId)
      await createCoupon(app, rewardPartnerId, { title: 'Otro cupón' })
      const res = await app.inject({ method: 'GET', url: '/api/coupon?offset=0&limit=10' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(2)
    })
  })

  describe('GET /api/coupon/available', () => {
    it('lista solo cupones disponibles', async () => {
      await createCoupon(app, rewardPartnerId, { isAvailable: true, title: 'Disponible' })
      await createCoupon(app, rewardPartnerId, { isAvailable: false, title: 'No disponible' })
      const res = await app.inject({ method: 'GET', url: '/api/coupon/available?offset=0&limit=10' })
      expect(res.statusCode).toBe(200)
      const coupons = res.json().data
      coupons.forEach((c: Record<string, unknown>) => {
        expect(c.isAvailable).toBe(true)
      })
    })
  })

  describe('PUT /api/coupon/:id', () => {
    it('actualiza los datos del cupón', async () => {
      const coupon = await createCoupon(app, rewardPartnerId)
      const res = await app.inject({
        method: 'PUT',
        url: `/api/coupon/${coupon.id}`,
        body: { ...COUPON_FIXTURE, costInPoints: 200, rewardPartnerId }
      })
      expect(res.statusCode).toBe(200)
    })

    it('el costInPoints actualizado persiste', async () => {
      const coupon = await createCoupon(app, rewardPartnerId)
      await app.inject({
        method: 'PUT',
        url: `/api/coupon/${coupon.id}`,
        body: { ...COUPON_FIXTURE, costInPoints: 200, rewardPartnerId }
      })
      const res = await app.inject({ method: 'GET', url: `/api/coupon/${coupon.id}` })
      expect(res.json().data.costInPoints).toBe(200)
    })
  })

  describe('DELETE /api/coupon/:id', () => {
    it('elimina un cupón existente', async () => {
      const coupon = await createCoupon(app, rewardPartnerId)
      const res = await app.inject({ method: 'DELETE', url: `/api/coupon/${coupon.id}` })
      expect(res.statusCode).toBe(200)
    })

    it('el GET devuelve 404 luego del DELETE', async () => {
      const coupon = await createCoupon(app, rewardPartnerId)
      await app.inject({ method: 'DELETE', url: `/api/coupon/${coupon.id}` })
      const res = await app.inject({ method: 'GET', url: `/api/coupon/${coupon.id}` })
      expect(res.statusCode).toBe(404)
    })
  })
})
