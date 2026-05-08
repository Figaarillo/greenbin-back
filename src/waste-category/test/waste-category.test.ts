/* eslint-disable no-console */
import { describe, expect, it } from 'vitest'
import { app } from '../../shared/test/test.setup'
import { createWasteCategory, WASTE_CATEGORY_FIXTURE, WASTE_CATEGORY_FIXTURE_2 } from '../../shared/test/test-helpers'

describe('WasteCategory — integration tests', () => {
  describe('POST /api/waste-category', () => {
    it('crea una categoría correctamente', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/waste-category', body: WASTE_CATEGORY_FIXTURE })
      expect(res.statusCode).toBe(201)
      const body = res.json()
      expect(body.data.id).toBeTruthy()
    })

    it('devuelve 409 con nombre duplicado', async () => {
      await createWasteCategory(app)
      const res = await app.inject({ method: 'POST', url: '/api/waste-category', body: WASTE_CATEGORY_FIXTURE })
      expect(res.statusCode).toBe(409)
    })

    it('devuelve 400 con body vacío', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/waste-category', body: {} })
      expect(res.statusCode).toBe(400)
    })

    it('devuelve 400 con pointsPerWeight en 0', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/waste-category',
        body: { ...WASTE_CATEGORY_FIXTURE, pointsPerWeight: 0 }
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/waste-category/:id', () => {
    it('obtiene una categoría por id', async () => {
      const category = await createWasteCategory(app)
      const res = await app.inject({ method: 'GET', url: `/api/waste-category/${category.id}` })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.name).toBe(WASTE_CATEGORY_FIXTURE.name)
    })

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/waste-category/00000000-0000-0000-0000-000000000000' })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 400 con id inválido', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/waste-category/id-invalido' })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/waste-category', () => {
    it('lista todas las categorías', async () => {
      await createWasteCategory(app)
      await createWasteCategory(app, WASTE_CATEGORY_FIXTURE_2)
      const res = await app.inject({ method: 'GET', url: '/api/waste-category?offset=0&limit=10' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(2)
    })

    it('devuelve lista vacía cuando no hay categorías', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/waste-category?offset=0&limit=10' })
      expect(res.statusCode).toBe(200)
      expect(res.json().data.length).toBe(0)
    })
  })

  describe('PUT /api/waste-category/:id', () => {
    it('actualiza los datos de una categoría', async () => {
      const category = await createWasteCategory(app)
      const res = await app.inject({
        method: 'PUT',
        url: `/api/waste-category/${category.id}`,
        body: { ...WASTE_CATEGORY_FIXTURE, name: 'Plástico Actualizado', pointsPerWeight: 15 }
      })
      expect(res.statusCode).toBe(200)
    })

    it('el cambio de pointsPerWeight persiste', async () => {
      const category = await createWasteCategory(app)
      await app.inject({
        method: 'PUT',
        url: `/api/waste-category/${category.id}`,
        body: { ...WASTE_CATEGORY_FIXTURE, pointsPerWeight: 20 }
      })
      const res = await app.inject({ method: 'GET', url: `/api/waste-category/${category.id}` })
      expect(res.json().data.pointsPerWeight).toBe(20)
    })

    it('devuelve 404 al actualizar un id inexistente', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/waste-category/00000000-0000-0000-0000-000000000000',
        body: WASTE_CATEGORY_FIXTURE
      })
      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/waste-category/:id', () => {
    it('elimina una categoría existente', async () => {
      const category = await createWasteCategory(app)
      const res = await app.inject({ method: 'DELETE', url: `/api/waste-category/${category.id}` })
      expect(res.statusCode).toBe(200)
    })

    it('el GET devuelve 404 luego del DELETE', async () => {
      const category = await createWasteCategory(app)
      await app.inject({ method: 'DELETE', url: `/api/waste-category/${category.id}` })
      const res = await app.inject({ method: 'GET', url: `/api/waste-category/${category.id}` })
      expect(res.statusCode).toBe(404)
    })

    it('devuelve 404 al eliminar id inexistente', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/waste-category/00000000-0000-0000-0000-000000000000'
      })
      expect(res.statusCode).toBe(404)
    })
  })
})
