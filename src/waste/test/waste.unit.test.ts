import { describe, expect, it } from 'vitest'
import WasteEntity from '../domain/entities/waste.entity'
import WasteCategoryEntity from '../../waste-category/domain/entities/waste-category.entity'

function makeCategory(pointsPerWeight = 10): WasteCategoryEntity {
  return new WasteCategoryEntity({
    name: 'Plástico',
    pointsPerWeight,
    description: 'Residuos plásticos',
    co2: 2.5
  })
}

function makeWaste(weight: number, pointsPerWeight = 10): WasteEntity {
  const category = makeCategory(pointsPerWeight)
  return new WasteEntity(category, weight, pointsPerWeight)
}

describe('WasteEntity — unit tests', () => {
  describe('constructor', () => {
    it('inicializa con points en 0', () => {
      const waste = makeWaste(2.0)
      expect(waste.points).toBe(0)
    })

    it('almacena el peso y puntosPorKilo correctamente', () => {
      const waste = makeWaste(3.5, 8)
      expect(waste.weight).toBe(3.5)
      expect(waste.pointsPerWeight).toBe(8)
    })
  })

  describe('calculatePoints()', () => {
    it('calcula correctamente: peso × puntosPorKilo', () => {
      const waste = makeWaste(2.0, 10)
      const points = waste.calculatePoints()
      expect(points).toBe(20)
    })

    it('redondea al entero más cercano cuando el resultado tiene decimales', () => {
      const waste = makeWaste(0.5, 25) // electrónico: 0.5 × 25 = 12.5 → 13
      const points = waste.calculatePoints()
      expect(points).toBe(13)
    })

    it('redondea hacia abajo cuando el decimal es menor a 0.5', () => {
      const waste = makeWaste(1.3, 10) // 1.3 × 10 = 13 exacto, no aplica; usamos un caso con .4x
      waste.weight = 1.24
      const points = waste.calculatePoints()
      expect(points).toBe(12) // 1.24 × 10 = 12.4 → 12
    })

    it('mantiene el valor cuando el resultado ya es un entero', () => {
      const waste = makeWaste(1.5, 10)
      const points = waste.calculatePoints()
      expect(points).toBe(15)
    })

    it('asigna el resultado a this.points', () => {
      const waste = makeWaste(3.0, 6)
      waste.calculatePoints()
      expect(waste.points).toBe(18)
    })

    it('recalcular sobreescribe el valor anterior', () => {
      const waste = makeWaste(1.0, 10)
      waste.calculatePoints()
      waste.weight = 2.0
      waste.calculatePoints()
      expect(waste.points).toBe(20)
    })

    it('retorna 0 puntos con peso 0', () => {
      const waste = makeWaste(0, 10)
      const points = waste.calculatePoints()
      expect(points).toBe(0)
    })
  })
})
