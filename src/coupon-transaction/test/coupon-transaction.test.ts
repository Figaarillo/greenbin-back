/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntityWithToken,
  createNeighborWithToken,
  createRewardPartnerWithToken,
  createCoupon,
  createResponsible,
  createGreenPoint,
  createWasteCategory
} from '../../shared/test/test-helpers'

describe('CouponTransaction — integration tests', () => {
  let neighborId: string
  let rewardPartnerId: string
  let couponId: string
  let neighborToken: string
  let rewardPartnerToken: string
  let entityToken: string

  beforeEach(async () => {
    const entity = await createEntityWithToken(app)
    entityToken = entity.token
    const neighbor = await createNeighborWithToken(app, entity.id)
    neighborToken = neighbor.token
    const partner = await createRewardPartnerWithToken(app, entity.id, entityToken)
    rewardPartnerToken = partner.token
    const coupon = await createCoupon(app, partner.id, { costInPoints: 50 }, entityToken)

    // Dar puntos al vecino vía una transacción de residuos
    const responsible = await createResponsible(app, entity.id, {}, entityToken)
    const greenPoint = await createGreenPoint(app, entity.id, {}, entityToken)
    const category = await createWasteCategory(app, {}, entityToken)

    await app.inject({
      method: 'POST',
      url: '/api/waste/transaction/delivery',
      headers: { authorization: `Bearer ${entityToken}` },
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
        headers: { authorization: `Bearer ${neighborToken}` },
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
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId: '00000000-0000-0000-0000-000000000000' }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 404 si el cupón no existe', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
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
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      const code = redeemRes.json().data.code

      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        headers: { authorization: `Bearer ${rewardPartnerToken}` },
        body: { code, rewardPartnerId, totalAmount: 1000 }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.status).toBe('USADO')
    })

    it('devuelve 404 con código inválido', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        headers: { authorization: `Bearer ${rewardPartnerToken}` },
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
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/neighbor/${neighborId}`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(1)
    })

    it('devuelve lista vacía si el vecino no tiene transacciones', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/neighbor/${neighborId}`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(0)
    })

    it('respeta offset/limit cuando se pasan, sin romper el caso sin params', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })

      const sinParams = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/neighbor/${neighborId}`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(sinParams.json().data.length).toBe(1)

      const conLimite = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/neighbor/${neighborId}?offset=0&limit=1`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(conLimite.statusCode).toBe(200)
      expect(conLimite.json().data.length).toBe(1)
    })
  })

  describe('GET /api/coupon-transaction/reward-partner/:rewardPartnerId/stats', () => {
    it('devuelve stats en cero para un local sin canjes', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/reward-partner/${rewardPartnerId}/stats`,
        headers: { authorization: `Bearer ${rewardPartnerToken}` }
      })
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(data.totalUsado).toBe(0)
      expect(data.uniqueNeighbors).toBe(0)
      expect(data.newNeighbors).toBe(0)
      expect(data.byCoupon).toEqual([])
    })

    it('cuenta un canje usado como vecino nuevo, con los puntos gastados', async () => {
      const redeemRes = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      const code = redeemRes.json().data.code

      await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        headers: { authorization: `Bearer ${rewardPartnerToken}` },
        body: { code, rewardPartnerId, totalAmount: 1000 }
      })

      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/reward-partner/${rewardPartnerId}/stats`,
        headers: { authorization: `Bearer ${rewardPartnerToken}` }
      })
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(data.totalUsado).toBe(1)
      expect(data.totalPuntos).toBe(50)
      expect(data.uniqueNeighbors).toBe(1)
      expect(data.newNeighbors).toBe(1)
      expect(data.avgVisitsPerNeighbor).toBe(1)
      expect(data.byCoupon.length).toBe(1)
      expect(data.byCoupon[0].couponId).toBe(couponId)
      expect(data.byCoupon[0].redemptions).toBe(1)
      expect(data.byCoupon[0].newNeighbors).toBe(1)
      expect(data.byCoupon[0].pointsSpent).toBe(50)
    })

    it('filtra por rango de fechas con from/to', async () => {
      const redeemRes = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      const code = redeemRes.json().data.code
      await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        headers: { authorization: `Bearer ${rewardPartnerToken}` },
        body: { code, rewardPartnerId, totalAmount: 1000 }
      })

      const mañana = new Date()
      mañana.setDate(mañana.getDate() + 1)
      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/reward-partner/${rewardPartnerId}/stats?from=${mañana.toISOString()}`,
        headers: { authorization: `Bearer ${rewardPartnerToken}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.totalUsado).toBe(0)
    })
  })

  describe('GET /api/coupon-transaction/:id', () => {
    it('obtiene una transacción por id', async () => {
      const redeemRes = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      const transactionId = redeemRes.json().data.id

      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/${transactionId}`,
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.id).toBe(transactionId)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/coupon-transaction/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(res.statusCode).toBe(404)
    })
  })
})
