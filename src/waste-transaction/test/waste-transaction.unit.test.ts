import { describe, expect, it } from 'vitest'
import WasteTransactionEntity from '../domain/entities/waste-transaction.entity'
import WasteTransactionDetailEntity from '../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'
import WasteEntity from '../../waste/domain/entities/waste.entity'
import WasteCategoryEntity from '../../waste-category/domain/entities/waste-category.entity'
import ResponsibleEntity from '../../responsible/domain/entities/responsible.entity'
import NeighborEntity from '../../neighbor/domain/entities/neighbor.entity'
import GreenPointEntity from '../../green-point/domain/entities/green-point.entity'
import EntityEntity from '../../entity/domain/entities/entity.entity'

const mockEntityData = {
  name: 'Entity Test',
  email: 'e@test.com',
  description: 'desc',
  password: 'pass',
  city: 'city',
  province: 'prov',
  coordinates: { latitude: -32.0, longitude: -63.0 }
}

const mockEntity = new EntityEntity(mockEntityData)

const mockResponsible = new ResponsibleEntity(
  {
    firstname: 'R',
    lastname: 'R',
    username: 'rr',
    email: 'r@r.com',
    password: 'p',
    dni: 11111111,
    phoneNumber: '1234567890',
    entityId: ''
  },
  mockEntity
)

const mockNeighbor = new NeighborEntity(
  'N',
  'N',
  'nn',
  'n@n.com',
  'p',
  22222222,
  '1234567890',
  new Date('1990-01-01'),
  mockEntity
)

const mockGreenPoint = new GreenPointEntity(
  {
    name: 'GP',
    email: 'gp@test.com',
    phoneNumber: '1234567890',
    description: 'desc',
    address: 'addr',
    coordinates: { latitude: -32.1, longitude: -63.1 },
    entityId: ''
  },
  mockEntity
)

const mockCategory = new WasteCategoryEntity({ name: 'Plástico', pointsPerWeight: 10, description: 'desc', co2: 2.5 })

describe('WasteTransactionEntity — unit tests', () => {
  describe('constructor', () => {
    it('inicializa totalPoints en 0', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      expect(tx.totalPoints).toBe(0)
    })

    it('inicializa con fecha actual', () => {
      const before = new Date()
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      const after = new Date()
      expect(tx.date.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(tx.date.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('addTransactionDetail()', () => {
    it.skip('agrega un detalle y acumula sus puntos en totalPoints', () => {
      const waste = new WasteEntity(mockCategory, 2.0, 10)
      waste.calculatePoints()
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      const detail = new WasteTransactionDetailEntity(waste, tx)
      detail.setPointsPerWeight()
      detail.setPoints()
      tx.addTransactionDetail(detail)
      expect(tx.totalPoints).toBe(20)
    })

    it.skip('acumula puntos de múltiples detalles', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      const waste1 = new WasteEntity(mockCategory, 2.0, 10)
      waste1.calculatePoints()
      const detail1 = new WasteTransactionDetailEntity(waste1, tx)
      detail1.setPointsPerWeight()
      detail1.setPoints()
      tx.addTransactionDetail(detail1)

      const waste2 = new WasteEntity(mockCategory, 1.5, 6)
      waste2.calculatePoints()
      const detail2 = new WasteTransactionDetailEntity(waste2, tx)
      detail2.setPointsPerWeight()
      detail2.setPoints()
      tx.addTransactionDetail(detail2)

      expect(tx.totalPoints).toBe(29)
    })
  })

  describe('calculateTotalPoints()', () => {
    it.skip('recalcula el total sumando todos los detalles existentes', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      const waste1 = new WasteEntity(mockCategory, 3.0, 10)
      waste1.calculatePoints()
      const detail1 = new WasteTransactionDetailEntity(waste1, tx)
      detail1.setPointsPerWeight()
      detail1.setPoints()
      tx.addTransactionDetail(detail1)

      const waste2 = new WasteEntity(mockCategory, 2.0, 6)
      waste2.calculatePoints()
      const detail2 = new WasteTransactionDetailEntity(waste2, tx)
      detail2.setPointsPerWeight()
      detail2.setPoints()
      tx.addTransactionDetail(detail2)

      const total = tx.calculateTotalPoints()
      expect(total).toBe(42)
      expect(tx.totalPoints).toBe(42)
    })

    it('retorna 0 si no hay detalles', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      const total = tx.calculateTotalPoints()
      expect(total).toBe(0)
    })
  })
})
