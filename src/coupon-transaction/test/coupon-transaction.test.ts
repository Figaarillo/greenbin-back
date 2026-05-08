/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntity,
  createNeighbor,
  createRewardPartner,
  createCoupon,
  createResponsible,
  createGreenPoint,
  createWasteCategory
} from '../../shared/test/test-helpers'

describe('CouponTransaction — integration tests', () => {
  let neighborId: string
  let rewardPartnerId: string
  let couponId: string

  beforeEach(async () => {
    const entity = await createEntity(app)
    const neighbor = await createNeighbor(app, entity.id)
    const partner = await createRewardPartner(app, entity.id)
    const coupon = await createCoupon(app, partner.id, { costInPoints: 50 })

    // Dar puntos al vecino vía una transacción de residuos
    const responsible = await createResponsible(app, entity.id)
    const greenPoint = await createGreenPoint(app, entity.id)
    const category = await createWasteCategory(app)

    await app.inject({
      method: 'POST',
      url: '/api/waste/transaction/delivery',
      body: {
        responsibleId: responsible.id,
        neighborId: neighbor.id,
        greenPointId: greenPoint.id,
        wastes: [{ categoryId: category.id, weight: 10.0 }] // 100 puntos
      }
    })

    neighborId = neighbor.id
    rewardPartnerId = partner.id
    couponId = coupon.id
  })

  describe('POST /api/redeem-coupon — canjear cupón', () => {
    it('el vecino canjea un cupón con puntos suficientes', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        body: { couponId, neighborId }
      })
      expect(res.statusCode).toBe(201)
      const body = res.json().data
      expect(body).toHaveProperty('code')
      expect(body.status).toBe('ADQUIRIDO')
    })

    it('devuelve 404 si el vecino no existe', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        body: { couponId, neighborId: '00000000-0000-0000-0000-000000000000' }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 404 si el cupón no existe', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        body: { couponId: '00000000-0000-0000-0000-000000000000', neighborId }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('POST /api/coupon-transaction/use — usar cupón', () => {
    it('el local marca el cupón como usado', async () => {
      const redeemRes = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        body: { couponId, neighborId }
      })
      const code = redeemRes.json().data.code

      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        body: { code, rewardPartnerId, totalAmount: 1000 }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.status).toBe('USADO')
    })

    it('devuelve 404 con código inválido', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        body: { code: 'XXXXXX', rewardPartnerId, totalAmount: 1000 }
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('GET /api/coupon-transaction/neighbor/:neighborId', () => {
    it('lista las transacciones de cupones de un vecino', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        body: { couponId, neighborId }
      })
      const res = await app.inject({ method: 'GET', url: `/api/coupon-transaction/neighbor/${neighborId}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(1)
    })

    it('devuelve lista vacía si el vecino no tiene transacciones', async () => {
      const res = await app.inject({ method: 'GET', url: `/api/coupon-transaction/neighbor/${neighborId}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(0)
    })
  })

  describe('GET /api/coupon-transaction/:id', () => {
    it('obtiene una transacción por id', async () => {
      const redeemRes = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        body: { couponId, neighborId }
      })
      const transactionId = redeemRes.json().data.id

      const res = await app.inject({ method: 'GET', url: `/api/coupon-transaction/${transactionId}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.id).toBe(transactionId)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/coupon-transaction/00000000-0000-0000-0000-000000000000'
      })
      expect(res.statusCode).toBe(404)
    })
  })
})
