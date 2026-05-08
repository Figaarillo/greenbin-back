/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import {
  createEntity,
  createNeighborWithToken,
  createResponsible,
  createGreenPoint,
  createWasteCategory
} from '../../shared/test/test-helpers'

describe('WasteTransaction — integration tests', () => {
  let neighborId: string
  let responsibleId: string
  let greenPointId: string
  let categoryId: string
  let token: string

  beforeEach(async () => {
    const entity = await createEntity(app)
    const neighbor = await createNeighborWithToken(app, entity.id)
    const responsible = await createResponsible(app, entity.id)
    const greenPoint = await createGreenPoint(app, entity.id)
    const category = await createWasteCategory(app)

    neighborId = neighbor.id
    responsibleId = responsible.id
    greenPointId = greenPoint.id
    categoryId = category.id
    token = neighbor.token
  })

  describe('POST /api/waste/transaction/delivery — flujo principal', () => {
    it('registra una entrega completa con un residuo', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: 2.0 }]
        }
      })
      expect(res.statusCode).toBe(201)
      const body = res.json().data
      expect(body.totalPoints).toBeGreaterThan(0)
      expect(body).toHaveProperty('id')
    })

    it('registra una entrega con múltiples residuos', async () => {
      const category2 = await createWasteCategory(app, {
        name: 'Vidrio',
        pointsPerWeight: 6,
        description: 'Vidrio',
        co2: 1.2
      })

      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [
            { categoryId, weight: 2.0 },
            { categoryId: category2.id, weight: 1.5 }
          ]
        }
      })
      expect(res.statusCode).toBe(201)
      expect(res.json().data.totalPoints).toBeGreaterThan(0)
    })

    it('el total de puntos es la suma de (peso × puntosPorKilo) de cada residuo', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: 3.0 }]
        }
      })
      expect(res.statusCode).toBe(201)
      // pointsPerWeight=10, weight=3 → totalPoints=30
      expect(res.json().data.totalPoints).toBe(30)
    })

    it('el vecino acumula los puntos luego de la transacción', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: 2.0 }]
        }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/neighbor/get-waste/${neighborId}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.json().data.points).toBe(20)
    })

    it('los residuos entregados aparecen en el historial del vecino', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: 1.0 }]
        }
      })
      const res = await app.inject({
        method: 'GET',
        url: `/api/neighbor/get-waste/${neighborId}`,
        headers: { authorization: `Bearer ${token}` }
      })
      expect(res.json().data.wastes.length).toBeGreaterThan(0)
    })

    it('devuelve 404 con responsibleId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId: '00000000-0000-0000-0000-000000000000',
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: 1.0 }]
        }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 404 con neighborId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId: '00000000-0000-0000-0000-000000000000',
          greenPointId,
          wastes: [{ categoryId, weight: 1.0 }]
        }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 404 con categoryId inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId: '00000000-0000-0000-0000-000000000000', weight: 1.0 }]
        }
      })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 400 con peso negativo', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: -1.0 }]
        }
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/waste/transaction/:id', () => {
    it('obtiene una transacción por id con sus detalles', async () => {
      const delivery = await app.inject({
        method: 'POST',
        url: '/api/waste/transaction/delivery',
        body: {
          responsibleId,
          neighborId,
          greenPointId,
          wastes: [{ categoryId, weight: 1.5 }]
        }
      })
      const transactionId = delivery.json().data.id

      const res = await app.inject({ method: 'GET', url: `/api/waste/transaction/${transactionId}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.id).toBe(transactionId)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/waste/transaction/00000000-0000-0000-0000-000000000000'
      })
      expect(res.statusCode).toBe(404)
    })
  })
})
