import { describe, expect, it } from 'vitest'
import NeighborEntity from '../domain/entities/neighbor.entity'
import EntityEntity from '../../entity/domain/entities/entity.entity'

const mockEntity = new EntityEntity({
  name: 'Entity Test',
  email: 'entity@test.com',
  description: 'desc',
  password: 'pass',
  city: 'city',
  province: 'province',
  coordinates: { latitude: -32.0, longitude: -63.0 }
})

function makeNeighbor(overrides: Partial<{ birthdate: Date }> = {}): NeighborEntity {
  return new NeighborEntity(
    'Carlos',
    'Garcia',
    'cgarcia',
    'carlos@test.com',
    'Test123@#.',
    30000001,
    '3535000001',
    overrides.birthdate ?? new Date('1990-05-14'),
    mockEntity
  )
}

describe('NeighborEntity — unit tests', () => {
  describe('constructor', () => {
    it('crea un vecino con puntos iniciales en 0', () => {
      const neighbor = makeNeighbor()
      expect(neighbor.points).toBe(0)
    })

    it('crea un vecino con isActive en true por defecto', () => {
      const neighbor = makeNeighbor()
      expect(neighbor.isActive).toBe(true)
    })

    it('genera un UUID como id', () => {
      const neighbor = makeNeighbor()
      expect(neighbor.id).toMatch(/^[0-9a-f-]{36}$/)
    })

    it('lanza error si la fecha de nacimiento es anterior a 1900', () => {
      expect(() => makeNeighbor({ birthdate: new Date('1899-12-31') })).toThrow('Year must be 1900 or later')
    })

    it('lanza error si la fecha de nacimiento es en el futuro', () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      expect(() => makeNeighbor({ birthdate: futureDate })).toThrow('Date cannot be in the future')
    })

    it('acepta la fecha 01/01/1900 como válida', () => {
      expect(() => makeNeighbor({ birthdate: new Date('1900-01-01') })).not.toThrow()
    })
  })

  describe('addPoints()', () => {
    it('suma puntos correctamente al saldo actual', () => {
      const neighbor = makeNeighbor()
      neighbor.addPoints(50)
      expect(neighbor.points).toBe(50)
    })

    it('suma acumulada funciona en múltiples llamadas', () => {
      const neighbor = makeNeighbor()
      neighbor.addPoints(30)
      neighbor.addPoints(20)
      expect(neighbor.points).toBe(50)
    })

    it('sumar 0 puntos no modifica el saldo', () => {
      const neighbor = makeNeighbor()
      neighbor.addPoints(100)
      neighbor.addPoints(0)
      expect(neighbor.points).toBe(100)
    })
  })

  describe('softDelete()', () => {
    it('marca al vecino como inactivo', () => {
      const neighbor = makeNeighbor()
      neighbor.softDelete()
      expect(neighbor.isActive).toBe(false)
    })

    it('no afecta los puntos acumulados', () => {
      const neighbor = makeNeighbor()
      neighbor.addPoints(100)
      neighbor.softDelete()
      expect(neighbor.points).toBe(100)
    })
  })
})
