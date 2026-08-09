/* eslint-disable no-console */
import { describe, expect, it, beforeEach } from 'vitest'
import { app } from '../../shared/test/test.setup'
import { Roles } from '../domain/entities/role'
import {
  createAdmin,
  createEntity,
  createEntityWithToken,
  createNeighbor,
  createResponsible,
  createRewardPartner,
  ENTITY_FIXTURE,
  NEIGHBOR_FIXTURE,
  RESPONSIBLE_FIXTURE,
  REWARD_PARTNER_FIXTURE
} from '../../shared/test/test-helpers'

async function login(email: string, password: string): Promise<{ statusCode: number; body: any }> {
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  })
  return { statusCode: res.statusCode, body: res.json() }
}

describe('UnifiedLogin — integration tests', () => {
  describe('POST /api/auth/login — éxito por rol', () => {
    let entityId: string
    let entityToken: string

    beforeEach(async () => {
      const entity = await createEntityWithToken(app)
      entityId = entity.id
      entityToken = entity.token
    })

    it('loguea como neighbor y devuelve role=neighbor', async () => {
      await createNeighbor(app, entityId, { email: 'unineighbor@test.com' })
      const { statusCode, body } = await login('unineighbor@test.com', NEIGHBOR_FIXTURE.password)

      expect(statusCode).toBe(200)
      expect(body.data.role).toBe(Roles.NEIGHBOR)
      expect(body.data).toHaveProperty('accessToken')
      expect(body.data).toHaveProperty('refreshToken')
      expect(body.data.id).toBeTruthy()
    })

    it('loguea como reward-partner (local) y devuelve role=rewardPartner', async () => {
      await createRewardPartner(
        app,
        entityId,
        { email: 'unipartner@test.com', username: 'unipartner', cuit: '20111222339' },
        entityToken
      )
      const { statusCode, body } = await login('unipartner@test.com', REWARD_PARTNER_FIXTURE.password)

      expect(statusCode).toBe(200)
      expect(body.data.role).toBe(Roles.REWARD_PARTNER)
    })

    it('loguea como responsible y devuelve role=responsible', async () => {
      await createResponsible(app, entityId, { email: 'uniresp@test.com', username: 'uniresp' }, entityToken)
      const { statusCode, body } = await login('uniresp@test.com', RESPONSIBLE_FIXTURE.password)

      expect(statusCode).toBe(200)
      expect(body.data.role).toBe(Roles.RESPONSIBLE)
    })

    it('loguea como admin (responsible con role=ADMIN) y devuelve role=admin', async () => {
      await createAdmin(entityId, { email: 'uniadmin@test.com', username: 'uniadmin' })
      const { statusCode, body } = await login('uniadmin@test.com', 'Test123@#.')

      expect(statusCode).toBe(200)
      expect(body.data.role).toBe(Roles.ADMIN)
    })

    it('loguea como entity y devuelve role=entity', async () => {
      await createEntity(app, {
        email: 'unientity@test.com',
        name: 'Uni Entity',
        coordinates: { latitude: -31.0, longitude: -60.0 }
      })
      const { statusCode, body } = await login('unientity@test.com', ENTITY_FIXTURE.password)

      expect(statusCode).toBe(200)
      expect(body.data.role).toBe(Roles.ENTITY)
    })
  })

  describe('POST /api/auth/login — 401 genérico, sin enumeración', () => {
    it('email inexistente y password incorrecta contra cuenta real devuelven el MISMO cuerpo 401', async () => {
      const entity = await createEntityWithToken(app)
      await createNeighbor(app, entity.id, { email: 'realaccount@test.com' })

      const unknownEmail = await login('nadie-existe@test.com', 'cualquiera')
      const wrongPassword = await login('realaccount@test.com', 'incorrecta-a-proposito')

      expect(unknownEmail.statusCode).toBe(401)
      expect(wrongPassword.statusCode).toBe(401)
      expect(unknownEmail.body).toEqual(wrongPassword.body)
    })
  })

  describe('POST /api/auth/login — rate-limit/lockout unificado', () => {
    it('bloquea con 429 tras 6 intentos fallidos consecutivos para el mismo email', async () => {
      const entity = await createEntityWithToken(app)
      await createNeighbor(app, entity.id, { email: 'lockout-neighbor@test.com' })

      for (let attempt = 0; attempt < 5; attempt++) {
        const { statusCode } = await login('lockout-neighbor@test.com', 'wrong-password')
        expect(statusCode).toBe(401)
      }

      const sixth = await login('lockout-neighbor@test.com', 'wrong-password')
      expect(sixth.statusCode).toBe(429)
    })

    // La misma política (umbral, ventana) rige sin importar a qué tabla resolvería el
    // email — antes cada uno de los 5 endpoints legacy tenía su propio rate-limit
    // fragmentado (o ninguno, como /api/superadmin/auth/login). No es un contador
    // numérico único compartido entre emails distintos (la key sigue siendo
    // email+IP por diseño) — es el MISMO mecanismo/umbral aplicado a cualquier rol.
    it('aplica el mismo umbral de lockout sin importar la tabla que resolvería el email', async () => {
      await createEntity(app, { email: 'lockout-entity@test.com', name: 'Lockout Entity' })

      for (let attempt = 0; attempt < 5; attempt++) {
        const { statusCode } = await login('lockout-entity@test.com', 'wrong-password')
        expect(statusCode).toBe(401)
      }

      const sixth = await login('lockout-entity@test.com', 'wrong-password')
      expect(sixth.statusCode).toBe(429)
    })

    it('un login exitoso resetea el contador: los intentos previos no se acumulan contra futuros', async () => {
      const entity = await createEntityWithToken(app)
      await createNeighbor(app, entity.id, { email: 'reset-neighbor@test.com' })

      await login('reset-neighbor@test.com', 'wrong-password')
      await login('reset-neighbor@test.com', 'wrong-password')

      const success = await login('reset-neighbor@test.com', NEIGHBOR_FIXTURE.password)
      expect(success.statusCode).toBe(200)

      for (let attempt = 0; attempt < 5; attempt++) {
        const { statusCode } = await login('reset-neighbor@test.com', 'wrong-password')
        expect(statusCode).toBe(401)
      }

      const sixth = await login('reset-neighbor@test.com', 'wrong-password')
      expect(sixth.statusCode).toBe(429)
    })
  })
})
