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

function makeDetail(weight: number, pointsPerWeight = 10): WasteTransactionDetailEntity {
  const waste = new WasteEntity(mockCategory, weight, pointsPerWeight)
  waste.calculatePoints()
  const transaction = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
  const detail = new WasteTransactionDetailEntity(waste, transaction)
  detail.setPointsPerWeight()
  detail.setPoints()
  return detail
}

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
    it('agrega un detalle y acumula sus puntos en totalPoints', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      const detail = makeDetail(2.0, 10) // 20 puntos
      tx.addTransactionDetail(detail)
      expect(tx.totalPoints).toBe(20)
    })

    it('acumula puntos de múltiples detalles', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      tx.addTransactionDetail(makeDetail(2.0, 10)) // 20
      tx.addTransactionDetail(makeDetail(1.5, 6)) // 9
      expect(tx.totalPoints).toBe(29)
    })
  })

  describe('calculateTotalPoints()', () => {
    it('recalcula el total sumando todos los detalles existentes', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      tx.addTransactionDetail(makeDetail(3.0, 10)) // 30
      tx.addTransactionDetail(makeDetail(2.0, 6)) // 12
      const total = tx.calculateTotalPoints()
      expect(total).toBe(42)
      expect(tx.totalPoints).toBe(42)
    })

    it('retorna 0 si no hay detalles', () => {
      const tx = new WasteTransactionEntity(mockResponsible, mockNeighbor, mockGreenPoint)
      expect(tx.calculateTotalPoints()).toBe(0)
    })
  })
})
