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
  let entityId: string
  // Se guardan los maestros para poder acreditarle puntos a un vecino creado
  // dentro de un test, no solo al del beforeEach.
  let responsibleId: string
  let greenPointId: string
  let categoryId: string

  // Dar puntos a un vecino vía una transacción de residuos
  const acreditarPuntos = async (id: string): Promise<void> => {
    await app.inject({
      method: 'POST',
      url: '/api/waste/transaction/delivery',
      headers: { authorization: `Bearer ${entityToken}` },
      body: {
        responsibleId,
        neighborId: id,
        greenPointId,
        wastes: [{ categoryId, weight: 10.0 }] // 100 puntos
      }
    })
  }

  beforeEach(async () => {
    const entity = await createEntityWithToken(app)
    entityToken = entity.token
    entityId = entity.id
    const neighbor = await createNeighborWithToken(app, entity.id)
    neighborToken = neighbor.token
    const partner = await createRewardPartnerWithToken(app, entity.id, entityToken)
    rewardPartnerToken = partner.token
    const coupon = await createCoupon(app, partner.id, { costInPoints: 50 }, entityToken)

    const responsible = await createResponsible(app, entity.id, {}, entityToken)
    const greenPoint = await createGreenPoint(app, entity.id, {}, entityToken)
    const category = await createWasteCategory(app, {}, entityToken)
    responsibleId = responsible.id
    greenPointId = greenPoint.id
    categoryId = category.id

    neighborId = neighbor.id
    rewardPartnerId = partner.id
    couponId = coupon.id

    await acreditarPuntos(neighborId)
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

    // 409 y no 404: el soft delete hace que un cupón borrado por el local sea
    // indistinguible de uno inexistente, y para el vecino los dos son la misma
    // historia ("ya no está disponible"), no un error técnico.
    it('devuelve 409 si el cupón no existe o el local lo borró', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId: '00000000-0000-0000-0000-000000000000', neighborId }
      })
      expect(res.statusCode).toBe(409)
      expect(res.json().message).toContain('ya no está disponible')
    })

    it('devuelve 409 si el local borró el cupón después de que el vecino lo vio', async () => {
      const borrado = await app.inject({
        method: 'DELETE',
        url: `/api/coupon/${couponId}`,
        headers: { authorization: `Bearer ${entityToken}` }
      })
      expect(borrado.statusCode).toBe(200)

      const res = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      expect(res.statusCode).toBe(409)
    })

    it('el cupón borrado por el local desaparece del catálogo del vecino', async () => {
      const antes = await app.inject({
        method: 'GET',
        url: `/api/coupon/available?entityId=${entityId}`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(antes.json().data.some((c: any) => c.id === couponId)).toBe(true)

      await app.inject({
        method: 'DELETE',
        url: `/api/coupon/${couponId}`,
        headers: { authorization: `Bearer ${entityToken}` }
      })

      const despues = await app.inject({
        method: 'GET',
        url: `/api/coupon/available?entityId=${entityId}`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(despues.json().data.some((c: any) => c.id === couponId)).toBe(false)
    })

    // El cupón es una plantilla del local, no una unidad de stock: que lo canjee
    // un vecino no lo agota para el resto. Antes fallaba con 500 por el UNIQUE
    // (coupon_id) que generaba el @OneToOne del modelo.
    it('dos vecinos distintos pueden canjear el mismo cupón', async () => {
      const primero = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      expect(primero.statusCode).toBe(201)

      const otroVecino = await createNeighborWithToken(app, entityId)
      await acreditarPuntos(otroVecino.id)

      const segundo = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${otroVecino.token}` },
        body: { couponId, neighborId: otroVecino.id }
      })
      expect(segundo.statusCode).toBe(201)
    })

    it('devuelve 409 si el mismo vecino ya tiene ese cupón ADQUIRIDO', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })

      const repetido = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      expect(repetido.statusCode).toBe(409)
      expect(repetido.json().message).toContain('Ya canjeaste este cupón')
    })
  })

  describe('GET /api/coupon-transaction/catalog/:neighborId', () => {
    const catalogo = async (): Promise<any[]> => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/catalog/${neighborId}?entityId=${entityId}`,
        headers: { authorization: `Bearer ${neighborToken}` }
      })
      expect(res.statusCode).toBe(200)
      return res.json().data
    }

    it('marca canjeable el cupón que el vecino todavía no canjeó', async () => {
      const entry = (await catalogo()).find(c => c.id === couponId)
      expect(entry).toMatchObject({ redeemable: true })
      expect(entry.reason).toBeUndefined()
    })

    // Es la regla que antes el front deducía cruzando dos endpoints: ahora la
    // resuelve la policy y la pantalla solo la pinta.
    it('marca no canjeable y con motivo el cupón ya adquirido', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })

      expect((await catalogo()).find(c => c.id === couponId)).toMatchObject({
        redeemable: false,
        reason: 'Ya canjeado'
      })
    })

    it('no incluye los cupones que el local borró', async () => {
      await app.inject({
        method: 'DELETE',
        url: `/api/coupon/${couponId}`,
        headers: { authorization: `Bearer ${entityToken}` }
      })

      expect((await catalogo()).some(c => c.id === couponId)).toBe(false)
    })

    it('devuelve rewardPartner como id plano, que es lo que usa el detalle', async () => {
      const entry = (await catalogo()).find(c => c.id === couponId)
      expect(entry.rewardPartner).toBe(rewardPartnerId)
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

    it('byCoupon separa el total de canjes de los efectivamente usados', async () => {
      // Un vecino no puede canjear dos veces el mismo cupón, así que el segundo
      // canje —el que queda sin usar— va sobre otro cupón del mismo local.
      const canjear = async (id: string): Promise<string> => {
        const res = await app.inject({
          method: 'POST',
          url: '/api/redeem-coupon',
          headers: { authorization: `Bearer ${neighborToken}` },
          body: { couponId: id, neighborId }
        })
        return res.json().data.code as string
      }

      const code = await canjear(couponId)
      await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        headers: { authorization: `Bearer ${rewardPartnerToken}` },
        body: { code, rewardPartnerId, totalAmount: 1000 }
      })

      const cupon2 = await createCoupon(
        app,
        rewardPartnerId,
        { costInPoints: 20, title: 'Cupón sin usar' },
        entityToken
      )
      await canjear(cupon2.id)

      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/reward-partner/${rewardPartnerId}/stats`,
        headers: { authorization: `Bearer ${rewardPartnerToken}` }
      })
      const byCoupon = res.json().data.byCoupon as Array<{
        couponId: string
        total: number
        redemptions: number
      }>

      const usado = byCoupon.find(c => c.couponId === couponId)
      expect(usado?.total).toBe(1)
      expect(usado?.redemptions).toBe(1)

      const sinUsar = byCoupon.find(c => c.couponId === cupon2.id)
      expect(sinUsar?.total).toBe(1)
      expect(sinUsar?.redemptions).toBe(0)
    })

    it('lista un cupón canjeado aunque todavía no se haya usado', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })

      const res = await app.inject({
        method: 'GET',
        url: `/api/coupon-transaction/reward-partner/${rewardPartnerId}/stats`,
        headers: { authorization: `Bearer ${rewardPartnerToken}` }
      })
      const data = res.json().data
      // Un cupón que nadie presenta es justamente la señal que el local necesita ver.
      expect(data.byCoupon.length).toBe(1)
      expect(data.byCoupon[0].total).toBe(1)
      expect(data.byCoupon[0].redemptions).toBe(0)
      expect(data.byCoupon[0].pointsSpent).toBe(0)
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
