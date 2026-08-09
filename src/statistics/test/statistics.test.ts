/* eslint-disable no-console */
import { type LightMyRequestResponse } from 'fastify'
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntity,
  createEntityWithToken,
  createNeighborWithToken,
  createResponsible,
  createGreenPoint,
  createWasteCategory,
  createRewardPartnerWithToken,
  createCoupon
} from '../../shared/test/test-helpers'

interface Co2Response {
  totalCo2: number
  byCategory: Array<{ categoryName: string; totalWeight: number; co2: number }>
}

async function createDelivery(
  token: string,
  neighborId: string,
  responsibleId: string,
  greenPointId: string,
  categoryId: string,
  weight: number
): Promise<void> {
  await app.inject({
    method: 'POST',
    url: '/api/waste/transaction/delivery',
    headers: { authorization: `Bearer ${token}` },
    body: { responsibleId, neighborId, greenPointId, wastes: [{ categoryId, weight }] }
  })
}

describe('Statistics — integration tests', () => {
  let entityId: string
  let entityToken: string
  let neighborId: string
  let neighborToken: string
  let responsibleId: string
  let greenPointId: string
  let categoryId: string
  let category2Id: string

  // Statistics routes are protected with protect(ENTITY|RESPONSIBLE|NEIGHBOR),
  // which only checks role (not ownership), so the entity token reaches any :id.
  async function authedGet(url: string): Promise<LightMyRequestResponse> {
    return await app.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${entityToken}` }
    })
  }

  beforeEach(async () => {
    const entity = await createEntityWithToken(app)
    entityToken = entity.token
    const neighbor = await createNeighborWithToken(app, entity.id)
    const responsible = await createResponsible(app, entity.id, {}, entity.token)
    const greenPoint = await createGreenPoint(app, entity.id, {}, entity.token)
    const category = await createWasteCategory(app, {}, entity.token)
    const category2 = await createWasteCategory(
      app,
      {
        name: 'Vidrio',
        pointsPerWeight: 6,
        description: 'Vidrio',
        co2: 1.2
      },
      entity.token
    )

    entityId = entity.id
    neighborId = neighbor.id
    neighborToken = neighbor.token
    responsibleId = responsible.id
    greenPointId = greenPoint.id
    categoryId = category.id
    category2Id = category2.id

    // Crear entregas de base para los tests.
    // NOTE: wastes_transactions_details.weight es una columna int, por eso se usan pesos enteros.
    await createDelivery(entityToken, neighborId, responsibleId, greenPointId, categoryId, 2)
    await createDelivery(entityToken, neighborId, responsibleId, greenPointId, categoryId, 3)
    await createDelivery(entityToken, neighborId, responsibleId, greenPointId, category2Id, 4)
  })

  describe('GET /api/statistics/entity/:entityId/total-recycled', () => {
    it('retorna el total reciclado de la entidad', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(data.totalWeight).toBeGreaterThan(0)
      expect(data.totalPoints).toBeGreaterThan(0)
      expect(data.totalTransactions).toBe(3)
    })

    it('el peso total es la suma de todas las entregas', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled`)
      // 2 + 3 + 4 = 9
      expect(res.json().data.totalWeight).toBe(9)
    })

    it('retorna ceros para una entidad sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Entregas',
        email: 'sinentregas@test.com',
        coordinates: { latitude: -32.5, longitude: -63.3 }
      })
      const res = await authedGet(`/api/statistics/entity/${otraEntidad.id}/total-recycled`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(data.totalWeight).toBe(0)
      expect(data.totalPoints).toBe(0)
      expect(data.totalTransactions).toBe(0)
    })

    it('filtra por rango de fechas con parámetros from/to', async () => {
      const mañana = new Date()
      mañana.setDate(mañana.getDate() + 1)
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled?from=${mañana.toISOString()}`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data.totalTransactions).toBe(0)
    })
  })

  describe('GET /api/statistics/entity/:entityId/green-points-ranking', () => {
    it('retorna el ranking de puntos verdes', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/green-points-ranking`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
    })

    it('cada item tiene greenPointId, name y totalWeight', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/green-points-ranking`)
      const item = res.json().data[0]
      expect(item).toHaveProperty('greenPointId')
      expect(item).toHaveProperty('name')
      expect(item).toHaveProperty('totalWeight')
      expect(item.totalWeight).toBe(9)
    })

    it('retorna array vacío para entidad sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Entregas 2',
        email: 'sinentregas2@test.com',
        coordinates: { latitude: -32.51, longitude: -63.31 }
      })
      const res = await authedGet(`/api/statistics/entity/${otraEntidad.id}/green-points-ranking`)
      expect(res.json().data).toEqual([])
    })
  })

  describe('GET /api/statistics/entity/:entityId/waste-by-category', () => {
    it('retorna el peso agrupado por categoría', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-category`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
    })

    it('cada item tiene categoryName y totalWeight', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-category`)
      const plastico = res.json().data.find((d: any) => d.categoryName === 'Plástico')
      const vidrio = res.json().data.find((d: any) => d.categoryName === 'Vidrio')
      expect(plastico.totalWeight).toBe(5) // 2 + 3
      expect(vidrio.totalWeight).toBe(4)
    })

    it('ordena por peso descendente', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-category`)
      const data = res.json().data
      expect(data[0].totalWeight).toBeGreaterThanOrEqual(data[1].totalWeight as number)
    })
  })

  describe('GET /api/statistics/entity/:entityId/waste-by-period', () => {
    it('retorna el peso agrupado por mes por defecto', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-period`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(1)
    })

    it('cada item tiene period y totalWeight', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-period`)
      const item = res.json().data[0]
      expect(item).toHaveProperty('period')
      expect(item).toHaveProperty('totalWeight')
      expect(item.totalWeight).toBeGreaterThan(0)
    })

    it('acepta groupBy=day', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-period?groupBy=day`)
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.json().data)).toBe(true)
    })

    it('retorna array vacío para entidad sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Entregas 3',
        email: 'sinentregas3@test.com',
        coordinates: { latitude: -32.52, longitude: -63.32 }
      })
      const res = await authedGet(`/api/statistics/entity/${otraEntidad.id}/waste-by-period`)
      expect(res.json().data).toEqual([])
    })
  })

  describe('GET /api/statistics/entity/:entityId/reward-partners-ranking', () => {
    // Deja un cupón ADQUIRIDO y, si `usar` es true, lo marca USADO.
    async function canjear(partnerId: string, partnerToken: string, couponId: string, usar: boolean): Promise<void> {
      const redeem = await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId, neighborId }
      })
      if (!usar) return
      await app.inject({
        method: 'POST',
        url: '/api/coupon-transaction/use',
        headers: { authorization: `Bearer ${partnerToken}` },
        body: { code: redeem.json().data.code, rewardPartnerId: partnerId, totalAmount: 500 }
      })
    }

    it('ordena los locales de la entidad por cupones efectivamente usados', async () => {
      const localA = await createRewardPartnerWithToken(app, entityId, entityToken, {
        name: 'Local A',
        username: 'local_a',
        email: 'locala@test.com',
        cuit: '20111111111',
        coordinates: { latitude: -32.71, longitude: -63.51 }
      })
      const localB = await createRewardPartnerWithToken(app, entityId, entityToken, {
        name: 'Local B',
        username: 'local_b',
        email: 'localb@test.com',
        cuit: '20222222222',
        coordinates: { latitude: -32.72, longitude: -63.52 }
      })
      // Un cupón por canje: canjear dos veces el mismo cupón viola una
      // restricción única de coupon_transactions.
      const cuponA1 = await createCoupon(app, localA.id, { costInPoints: 1, title: 'Cupón A1' }, entityToken)
      const cuponA2 = await createCoupon(app, localA.id, { costInPoints: 1, title: 'Cupón A2' }, entityToken)
      const cuponB1 = await createCoupon(app, localB.id, { costInPoints: 1, title: 'Cupón B1' }, entityToken)
      const cuponB2 = await createCoupon(app, localB.id, { costInPoints: 1, title: 'Cupón B2' }, entityToken)

      await canjear(localA.id, localA.token, cuponA1.id, true)
      await canjear(localA.id, localA.token, cuponA2.id, true)
      await canjear(localB.id, localB.token, cuponB1.id, true)
      // Adquirido pero sin usar: no debe contar como canjeado.
      await canjear(localB.id, localB.token, cuponB2.id, false)

      const res = await authedGet(`/api/statistics/entity/${entityId}/reward-partners-ranking`)
      expect(res.statusCode).toBe(200)

      const data = res.json().data
      expect(data.length).toBe(2)
      expect(data[0].name).toBe('Local A')
      expect(data[0].used).toBe(2)
      expect(data[1].name).toBe('Local B')
      expect(data[1].used).toBe(1)
      expect(data[1].acquired).toBe(1)
    })

    it('cada item trae el nombre, los estados y los puntos gastados', async () => {
      const local = await createRewardPartnerWithToken(app, entityId, entityToken, {
        name: 'Kiosco',
        username: 'kiosco',
        email: 'kiosco@test.com',
        cuit: '20333333333',
        coordinates: { latitude: -32.73, longitude: -63.53 }
      })
      const cupon = await createCoupon(app, local.id, { costInPoints: 7 }, entityToken)
      await canjear(local.id, local.token, cupon.id, true)

      const item = (await authedGet(`/api/statistics/entity/${entityId}/reward-partners-ranking`)).json().data[0]
      expect(item).toHaveProperty('rewardPartnerId')
      expect(item.name).toBe('Kiosco')
      expect(item.used).toBe(1)
      expect(item.acquired).toBe(0)
      expect(item.expired).toBe(0)
      expect(item.pointsSpent).toBe(7)
    })

    it('retorna array vacío para una entidad sin locales', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Locales',
        email: 'sinlocales@test.com',
        coordinates: { latitude: -32.7, longitude: -63.5 }
      })
      const res = await authedGet(`/api/statistics/entity/${otraEntidad.id}/reward-partners-ranking`)
      expect(res.json().data).toEqual([])
    })

    it('respeta to=hoy, así los canjes del día aparecen', async () => {
      const local = await createRewardPartnerWithToken(app, entityId, entityToken, {
        name: 'Panadería',
        username: 'panaderia',
        email: 'pan@test.com',
        cuit: '20444444444',
        coordinates: { latitude: -32.74, longitude: -63.54 }
      })
      const cupon = await createCoupon(app, local.id, { costInPoints: 1 }, entityToken)
      await canjear(local.id, local.token, cupon.id, true)

      const d = new Date()
      const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
        2,
        '0'
      )}`
      const res = await authedGet(`/api/statistics/entity/${entityId}/reward-partners-ranking?to=${hoy}`)
      expect(res.json().data[0].used).toBe(1)
    })
  })

  describe('GET /api/statistics/entity/:entityId/points-balance', () => {
    it('otorgados, canjeados y en circulación de la entidad', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/points-balance`)
      expect(res.statusCode).toBe(200)

      const data = res.json().data
      // Las 3 entregas del beforeEach otorgaron puntos y nadie canjeó nada.
      expect(data.granted).toBeGreaterThan(0)
      expect(data.spent).toBe(0)
      expect(data.outstanding).toBe(data.granted)
    })

    it('los puntos en circulación son el saldo real de los vecinos', async () => {
      const data = (await authedGet(`/api/statistics/entity/${entityId}/points-balance`)).json().data
      // `outstanding` sale de sumar neighbors.points, no de restar dos totales:
      // es el saldo que los vecinos pueden gastar hoy.
      expect(data.outstanding).toBe(data.granted - data.spent)
      expect(data.neighborsWithBalance).toBe(1)
    })

    it('canjear un cupón mueve puntos de circulación a canjeados', async () => {
      const local = await createRewardPartnerWithToken(app, entityId, entityToken, {
        name: 'Kiosco Puntos',
        username: 'kiosco_puntos',
        email: 'kioscopuntos@test.com',
        cuit: '20555555555',
        coordinates: { latitude: -32.75, longitude: -63.55 }
      })
      const cupon = await createCoupon(app, local.id, { costInPoints: 10, title: 'Cupón de prueba' }, entityToken)

      const antes = (await authedGet(`/api/statistics/entity/${entityId}/points-balance`)).json().data

      await app.inject({
        method: 'POST',
        url: '/api/redeem-coupon',
        headers: { authorization: `Bearer ${neighborToken}` },
        body: { couponId: cupon.id, neighborId }
      })

      const despues = (await authedGet(`/api/statistics/entity/${entityId}/points-balance`)).json().data
      expect(despues.spent).toBe(antes.spent + 10)
      expect(despues.outstanding).toBe(antes.outstanding - 10)
      // Lo otorgado no cambia: canjear no borra el historial de lo ganado.
      expect(despues.granted).toBe(antes.granted)
    })

    it('retorna ceros para una entidad sin actividad', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Puntos',
        email: 'sinpuntos@test.com',
        coordinates: { latitude: -32.9, longitude: -63.7 }
      })
      const data = (await authedGet(`/api/statistics/entity/${otraEntidad.id}/points-balance`)).json().data
      expect(data).toEqual({ granted: 0, spent: 0, outstanding: 0, neighborsWithBalance: 0 })
    })
  })

  describe('GET /api/statistics/entity/:entityId/co2-avoided', () => {
    // Fixtures del beforeEach: Plástico (co2 por defecto) 2+3 kg, Vidrio (co2 1.2) 4 kg.
    it('retorna el CO2 evitado total y el desglose por categoría', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/co2-avoided`)
      expect(res.statusCode).toBe(200)

      const data = res.json().data
      expect(data.totalCo2).toBeGreaterThan(0)
      expect(Array.isArray(data.byCategory)).toBe(true)

      const vidrio = data.byCategory.find((c: { categoryName: string }) => c.categoryName === 'Vidrio')
      // 4 kg × 1.2 kg CO2/kg = 4.8
      expect(vidrio.co2).toBeCloseTo(4.8, 2)
      expect(vidrio.totalWeight).toBe(4)
    })

    it('el total es la suma del desglose', async () => {
      const data = (await authedGet(`/api/statistics/entity/${entityId}/co2-avoided`)).json().data as Co2Response
      const suma = data.byCategory.reduce((acc, c) => acc + c.co2, 0)
      expect(data.totalCo2).toBeCloseTo(suma, 2)
    })

    it('ordena el desglose por CO2 descendente', async () => {
      const data = (await authedGet(`/api/statistics/entity/${entityId}/co2-avoided`)).json().data as Co2Response
      for (let i = 0; i < data.byCategory.length - 1; i++) {
        expect(data.byCategory[i].co2).toBeGreaterThanOrEqual(data.byCategory[i + 1].co2)
      }
    })

    it('respeta to=hoy, así las entregas del día cuentan', async () => {
      const d = new Date()
      const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(
        2,
        '0'
      )}`
      const res = await authedGet(`/api/statistics/entity/${entityId}/co2-avoided?to=${hoy}`)
      expect(res.json().data.totalCo2).toBeGreaterThan(0)
    })

    it('retorna cero para una entidad sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin CO2',
        email: 'sinco2@test.com',
        coordinates: { latitude: -32.8, longitude: -63.6 }
      })
      const data = (await authedGet(`/api/statistics/entity/${otraEntidad.id}/co2-avoided`)).json().data
      expect(data.totalCo2).toBe(0)
      expect(data.byCategory).toEqual([])
    })
  })

  describe('GET /api/statistics/entity/:entityId/counts', () => {
    it('retorna los contadores del municipio', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/counts`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(data.greenPoints).toBe(1)
      expect(data.responsibles).toBe(1)
      expect(data.neighbors).toBe(1)
      expect(data.rewardPartners).toBe(0)
    })

    it('cuenta solo los registros activos', async () => {
      await createGreenPoint(app, entityId, { coordinates: { latitude: -32.61, longitude: -63.41 } }, entityToken)
      const antes = (await authedGet(`/api/statistics/entity/${entityId}/counts`)).json().data
      expect(antes.greenPoints).toBe(2)
    })

    it('retorna ceros para una entidad recién creada', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Nada',
        email: 'sinnada@test.com',
        coordinates: { latitude: -32.6, longitude: -63.4 }
      })
      const data = (await authedGet(`/api/statistics/entity/${otraEntidad.id}/counts`)).json().data
      expect(data).toEqual({ greenPoints: 0, responsibles: 0, neighbors: 0, rewardPartners: 0 })
    })
  })

  describe('Límite del ranking de puntos verdes', () => {
    it('acepta ?limit para acotar el ranking', async () => {
      const otroPuntoVerde = await createGreenPoint(
        app,
        entityId,
        { coordinates: { latitude: -32.62, longitude: -63.42 } },
        entityToken
      )
      await createDelivery(entityToken, neighborId, responsibleId, otroPuntoVerde.id, categoryId, 1)

      const sinLimite = await authedGet(`/api/statistics/entity/${entityId}/green-points-ranking`)
      expect(sinLimite.json().data.length).toBe(2)

      const conLimite = await authedGet(`/api/statistics/entity/${entityId}/green-points-ranking?limit=1`)
      expect(conLimite.statusCode).toBe(200)
      expect(conLimite.json().data.length).toBe(1)
      // El limit corta después de ordenar: queda el punto verde con más kg.
      expect(conLimite.json().data[0].totalWeight).toBe(9)
    })

    it('ignora un limit inválido en vez de romper', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/green-points-ranking?limit=cero`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(1)
    })
  })

  describe('Filtros de fecha (from/to)', () => {
    // Las entregas del beforeEach se crean con `date = new Date()` (ahora mismo).
    const hoy = (): string => {
      const d = new Date()
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const dia = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${mes}-${dia}`
    }

    it('to=hoy (fecha sin hora) incluye las entregas de hoy', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled?to=${hoy()}`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data.totalTransactions).toBe(3)
      expect(res.json().data.totalWeight).toBe(9)
    })

    it('from=hoy y to=hoy devuelve las entregas del día en curso', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled?from=${hoy()}&to=${hoy()}`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data.totalTransactions).toBe(3)
    })

    it('waste-by-category respeta to=hoy', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-category?to=${hoy()}`)
      expect(res.statusCode).toBe(200)
      const vidrio = res.json().data.find((d: { categoryName: string }) => d.categoryName === 'Vidrio')
      expect(vidrio?.totalWeight).toBe(4)
    })

    it('green-points-ranking respeta to=hoy', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/green-points-ranking?to=${hoy()}`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data[0]?.totalWeight).toBe(9)
    })

    it('waste-by-period respeta to=hoy', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/waste-by-period?groupBy=day&to=${hoy()}`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(1)
      expect(res.json().data[0].totalWeight).toBe(9)
    })

    it('sigue aceptando timestamps ISO completos', async () => {
      const enUnaHora = new Date(Date.now() + 3600000).toISOString()
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled?to=${enUnaHora}`)
      expect(res.statusCode).toBe(200)
      expect(res.json().data.totalTransactions).toBe(3)
    })

    it('rechaza una fecha inválida con 400 en vez de romper', async () => {
      const res = await authedGet(`/api/statistics/entity/${entityId}/total-recycled?from=no-es-una-fecha`)
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/statistics/neighbor/:neighborId/deliveries', () => {
    it('retorna las entregas del vecino con detalles', async () => {
      const res = await authedGet(`/api/statistics/neighbor/${neighborId}/deliveries`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(3)
    })

    it('cada entrega tiene transactionId, date, greenPointName, totalPoints y details', async () => {
      const res = await authedGet(`/api/statistics/neighbor/${neighborId}/deliveries`)
      const item = res.json().data[0]
      expect(item).toHaveProperty('transactionId')
      expect(item).toHaveProperty('date')
      expect(item).toHaveProperty('greenPointName')
      expect(item).toHaveProperty('totalPoints')
      expect(item).toHaveProperty('details')
      expect(Array.isArray(item.details)).toBe(true)
    })

    it('los detalles contienen categoryName, weight y points', async () => {
      const res = await authedGet(`/api/statistics/neighbor/${neighborId}/deliveries`)
      const detail = res.json().data[0].details[0]
      expect(detail).toHaveProperty('categoryName')
      expect(detail).toHaveProperty('weight')
      expect(detail).toHaveProperty('points')
    })

    it('retorna array vacío para un vecino sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Entidad Extra',
        email: 'extra@test.com',
        coordinates: { latitude: -32.53, longitude: -63.33 }
      })
      const vecinoSinEntregas = await createNeighborWithToken(app, otraEntidad.id, {
        username: 'sinentregas',
        email: 'sinentregas@vecino.com',
        dni: 99999999
      })
      const res = await authedGet(`/api/statistics/neighbor/${vecinoSinEntregas.id}/deliveries`)
      expect(res.json().data).toEqual([])
    })

    it('ordena las entregas de más reciente a más antigua', async () => {
      const res = await authedGet(`/api/statistics/neighbor/${neighborId}/deliveries`)
      const data = res.json().data
      const fechas: number[] = data.map((d: { date: string }) => new Date(d.date).getTime())
      for (let i = 0; i < fechas.length - 1; i++) {
        expect(fechas[i]).toBeGreaterThanOrEqual(fechas[i + 1])
      }
    })
  })

  describe('GET /api/statistics/green-point/:greenPointId/neighbor-ranking', () => {
    it('retorna el ranking de vecinos del punto verde', async () => {
      const res = await authedGet(`/api/statistics/green-point/${greenPointId}/neighbor-ranking`)
      expect(res.statusCode).toBe(200)
      const data = res.json().data
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
    })

    it('cada item tiene neighborId, firstname, lastname, totalWeight y totalPoints', async () => {
      const res = await authedGet(`/api/statistics/green-point/${greenPointId}/neighbor-ranking`)
      const item = res.json().data[0]
      expect(item).toHaveProperty('neighborId')
      expect(item).toHaveProperty('firstname')
      expect(item).toHaveProperty('lastname')
      expect(item).toHaveProperty('totalWeight')
      expect(item).toHaveProperty('totalPoints')
      expect(item.totalWeight).toBe(9) // 2 + 3 + 4
    })

    it('retorna array vacío para un punto verde sin entregas', async () => {
      const otroPuntoVerde = await createGreenPoint(
        app,
        entityId,
        { coordinates: { latitude: -32.42, longitude: -63.25 } },
        entityToken
      )
      const res = await authedGet(`/api/statistics/green-point/${otroPuntoVerde.id}/neighbor-ranking`)
      expect(res.json().data).toEqual([])
    })
  })
})
