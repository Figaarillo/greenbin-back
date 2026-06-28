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
  createWasteCategory
} from '../../shared/test/test-helpers'

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
    responsibleId = responsible.id
    greenPointId = greenPoint.id
    categoryId = category.id
    category2Id = category2.id

    // Crear entregas de base para los tests
    await createDelivery(entityToken, neighborId, responsibleId, greenPointId, categoryId, 2.0)
    await createDelivery(entityToken, neighborId, responsibleId, greenPointId, categoryId, 1.5)
    await createDelivery(entityToken, neighborId, responsibleId, greenPointId, category2Id, 3.0)
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
      // 2.0 + 1.5 + 3.0 = 6.5
      expect(res.json().data.totalWeight).toBe(6.5)
    })

    it('retorna ceros para una entidad sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Entregas',
        email: 'sinentregas@test.com'
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
      expect(item.totalWeight).toBe(6.5)
    })

    it('retorna array vacío para entidad sin entregas', async () => {
      const otraEntidad = await createEntity(app, {
        name: 'Sin Entregas 2',
        email: 'sinentregas2@test.com'
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
      expect(plastico.totalWeight).toBe(3.5) // 2.0 + 1.5
      expect(vidrio.totalWeight).toBe(3.0)
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
        email: 'sinentregas3@test.com'
      })
      const res = await authedGet(`/api/statistics/entity/${otraEntidad.id}/waste-by-period`)
      expect(res.json().data).toEqual([])
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
      const otraEntidad = await createEntity(app, { name: 'Entidad Extra', email: 'extra@test.com' })
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
})
