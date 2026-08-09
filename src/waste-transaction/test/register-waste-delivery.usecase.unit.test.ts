import { describe, expect, it, vi } from 'vitest'
import RegisterWasteDeliveryUseCase from '../application/usecases/register-waste-delivery.usecase'
import type RegisterWasteTransactionUseCase from '../application/usecases/register.usecase'
import type UpdateWasteTransactionUseCase from '../application/usecases/update.usecase'
import type RegisterWasteTransactionDetailUseCase from '../../waste-transaction-detail/application/usecases/register.usecase'
import type RegisterWasteUseCase from '../../waste/application/usecases/register.usecase'
import type FindNeighborByIDUseCase from '../../neighbor/application/usecases/find-by-id.usecase'
import type FindResponsibleByIDUseCase from '../../responsible/application/usecases/find-by-id.usecase'
import type NotificationDispatcher from '../../notification/application/service/notification-dispatcher.service'
import { NotificationCategory } from '../../notification/domain/enums/notification-category.enum'
import { Roles } from '../../auth/domain/entities/role'
import EntityEntity from '../../entity/domain/entities/entity.entity'
import NeighborEntity from '../../neighbor/domain/entities/neighbor.entity'
import ResponsibleEntity from '../../responsible/domain/entities/responsible.entity'
import GreenPointEntity from '../../green-point/domain/entities/green-point.entity'
import WasteCategoryEntity from '../../waste-category/domain/entities/waste-category.entity'
import WasteEntity from '../../waste/domain/entities/waste.entity'
import type WasteTransactionEntity from '../domain/entities/waste-transaction.entity'
import type WasteTransactionDetailEntity from '../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'

const mockEntity = new EntityEntity({
  name: 'Entity Test',
  email: 'e@test.com',
  description: 'desc',
  password: 'pass',
  city: 'city',
  province: 'prov',
  coordinates: { latitude: -32.0, longitude: -63.0 }
})

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

function makeUseCase(dispatch: ReturnType<typeof vi.fn>): RegisterWasteDeliveryUseCase {
  // Se usan stubs planos (no entidades reales) para neighbor/transaction porque
  // sus métodos `registerWaste`/`addTransactionDetail` llaman a `Collection.add()`
  // de MikroORM, que requiere metadata de un ORM inicializado — inviable en un
  // unit test puro (mismo motivo por el que este repo ya deja esos casos con
  // `it.skip` en waste-transaction.unit.test.ts). El foco de este test es
  // verificar el dispatcher de notificaciones, no el comportamiento de la
  // Collection en sí (ya cubierto por los tests de integración).
  const transaction = {
    id: 'transaction-1',
    totalPoints: 0,
    addTransactionDetail(): void {},
    calculateTotalPoints(): number {
      return 0
    }
  } as unknown as WasteTransactionEntity

  const neighborStub = {
    id: mockNeighbor.id,
    firstname: mockNeighbor.firstname,
    lastname: mockNeighbor.lastname,
    email: mockNeighbor.email,
    points: 0,
    addPoints(): void {},
    registerWaste(): void {}
  } as unknown as NeighborEntity

  const registerTransaction = { exec: async () => transaction } as unknown as RegisterWasteTransactionUseCase
  const updateTransaction = { exec: async () => transaction } as unknown as UpdateWasteTransactionUseCase
  const registerTransactionDetail = {
    exec: async () => {
      const waste = new WasteEntity(mockCategory, 2.0, 10)
      waste.calculatePoints()
      return { points: waste.points } as unknown as WasteTransactionDetailEntity
    }
  } as unknown as RegisterWasteTransactionDetailUseCase
  const registerWaste = {
    exec: async () => new WasteEntity(mockCategory, 2.0, 10)
  } as unknown as RegisterWasteUseCase
  const findNeighborByID = { exec: async () => neighborStub } as unknown as FindNeighborByIDUseCase
  const findResponsibleByID = { exec: async () => mockResponsible } as unknown as FindResponsibleByIDUseCase
  const notificationDispatcher = { dispatch } as unknown as NotificationDispatcher

  return new RegisterWasteDeliveryUseCase(
    registerTransaction,
    updateTransaction,
    registerTransactionDetail,
    registerWaste,
    findNeighborByID,
    findResponsibleByID,
    notificationDispatcher
  )
}

describe('RegisterWasteDeliveryUseCase — notificaciones', () => {
  it('dispara POINTS_DELIVERED tanto al vecino como al responsable', async () => {
    const dispatch = vi.fn()
    const useCase = makeUseCase(dispatch)

    await useCase.exec({
      responsibleId: mockResponsible.id,
      neighborId: mockNeighbor.id,
      greenPointId: mockGreenPoint.id,
      wastes: [{ categoryId: mockCategory.id, weight: 2.0 }]
    })

    expect(dispatch).toHaveBeenCalledTimes(2)

    const neighborEvent = dispatch.mock.calls[0][0]
    expect(neighborEvent.recipientId).toBe(mockNeighbor.id)
    expect(neighborEvent.recipientRole).toBe(Roles.NEIGHBOR)
    expect(neighborEvent.category).toBe(NotificationCategory.POINTS_DELIVERED)
    expect(typeof neighborEvent.sendEmail).toBe('function')

    const responsibleEvent = dispatch.mock.calls[1][0]
    expect(responsibleEvent.recipientId).toBe(mockResponsible.id)
    expect(responsibleEvent.recipientRole).toBe(Roles.RESPONSIBLE)
    expect(responsibleEvent.category).toBe(NotificationCategory.POINTS_DELIVERED)
    // Al responsable, por ahora, solo in-app (sin mail).
    expect(responsibleEvent.sendEmail).toBeUndefined()
  })
})
