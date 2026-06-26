/* eslint-disable no-console */
import { describe, expect, it, beforeEach, vi } from 'vitest'
import jwt from 'jsonwebtoken'
import { app } from '../../shared/test/test.setup'
import {
  createEntity,
  createNeighborWithToken,
  createResponsible,
  createRewardPartner,
  ENTITY_FIXTURE,
  NEIGHBOR_FIXTURE,
  RESPONSIBLE_FIXTURE,
  REWARD_PARTNER_FIXTURE
} from '../../shared/test/test-helpers'

// Mock EmailService para evitar envíos reales de correo
vi.mock('../application/service/email.service', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      sendPasswordResetOtp: vi.fn().mockResolvedValue(undefined)
    }))
  }
})

function extractOtpFromToken(resetToken: string): string {
  const payload = jwt.decode(resetToken) as { otp: string } | null
  if (payload == null) throw new Error('Token inválido')
  return payload.otp
}

describe('PasswordReset — integration tests', () => {
  describe('POST /api/auth/forgot-password', () => {
    describe('userType: neighbor', () => {
      let neighborEmail: string

      beforeEach(async () => {
        const entity = await createEntity(app)
        await createNeighborWithToken(app, entity.id)
        neighborEmail = NEIGHBOR_FIXTURE.email
      })

      it('retorna resetToken cuando el email existe', async () => {
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: neighborEmail, userType: 'neighbor' }
        })
        expect(res.statusCode).toBe(200)
        expect(res.json().data).toHaveProperty('resetToken')
      })

      it('el resetToken es un JWT válido con email y userType', async () => {
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: neighborEmail, userType: 'neighbor' }
        })
        const { resetToken } = res.json().data as { resetToken: string }
        const payload = jwt.decode(resetToken) as Record<string, unknown>
        expect(payload.email).toBe(neighborEmail)
        expect(payload.userType).toBe('neighbor')
        expect(payload.otp).toMatch(/^\d{6}$/)
      })

      it('retorna 200 con mensaje genérico cuando el email no existe', async () => {
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: 'noexiste@test.com', userType: 'neighbor' }
        })
        expect(res.statusCode).toBe(200)
        // No debe revelar que el email no existe
        expect(res.json().data).toBeUndefined()
      })
    })

    describe('userType: entity', () => {
      it('retorna resetToken para una entidad existente', async () => {
        await createEntity(app)
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: ENTITY_FIXTURE.email, userType: 'entity' }
        })
        expect(res.statusCode).toBe(200)
        expect(res.json().data).toHaveProperty('resetToken')
      })
    })

    describe('userType: responsible', () => {
      it('retorna resetToken para un responsable existente', async () => {
        const entity = await createEntity(app)
        await createResponsible(app, entity.id)
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: RESPONSIBLE_FIXTURE.email, userType: 'responsible' }
        })
        expect(res.statusCode).toBe(200)
        expect(res.json().data).toHaveProperty('resetToken')
      })
    })

    describe('userType: reward-partner', () => {
      it('retorna resetToken para un local adherido existente', async () => {
        const entity = await createEntity(app)
        await createRewardPartner(app, entity.id)
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: REWARD_PARTNER_FIXTURE.email, userType: 'reward-partner' }
        })
        expect(res.statusCode).toBe(200)
        expect(res.json().data).toHaveProperty('resetToken')
      })
    })
  })

  describe('POST /api/auth/reset-password', () => {
    describe('flujo completo con vecino', () => {
      let neighborEmail: string

      beforeEach(async () => {
        const entity = await createEntity(app)
        await createNeighborWithToken(app, entity.id)
        neighborEmail = NEIGHBOR_FIXTURE.email
      })

      it('cambia la contraseña exitosamente con OTP correcto', async () => {
        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: neighborEmail, userType: 'neighbor' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }
        const otp = extractOtpFromToken(resetToken)

        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp, newPassword: 'NuevaPass123@#.' }
        })
        expect(res.statusCode).toBe(200)
      })

      it('puede iniciar sesión con la nueva contraseña luego del reset', async () => {
        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: neighborEmail, userType: 'neighbor' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }
        const otp = extractOtpFromToken(resetToken)
        const newPassword = 'NuevaPass456@#.'

        await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp, newPassword }
        })

        const loginRes = await app.inject({
          method: 'POST',
          url: '/api/neighbor/auth/login',
          body: { email: neighborEmail, password: newPassword }
        })
        expect(loginRes.statusCode).toBe(200)
        expect(loginRes.json().data).toHaveProperty('accessToken')
      })

      it('la contraseña anterior ya no funciona luego del reset', async () => {
        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: neighborEmail, userType: 'neighbor' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }
        const otp = extractOtpFromToken(resetToken)

        await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp, newPassword: 'NuevaPass789@#.' }
        })

        const loginRes = await app.inject({
          method: 'POST',
          url: '/api/neighbor/auth/login',
          body: { email: neighborEmail, password: NEIGHBOR_FIXTURE.password }
        })
        expect(loginRes.statusCode).toBe(401)
      })

      it('falla con OTP incorrecto', async () => {
        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: neighborEmail, userType: 'neighbor' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }

        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp: '000000', newPassword: 'NuevaPass000@#.' }
        })
        expect(res.statusCode).toBe(500)
      })

      it('falla con resetToken manipulado', async () => {
        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: {
            resetToken: 'token.invalido.manipulado',
            otp: '123456',
            newPassword: 'NuevaPass000@#.'
          }
        })
        expect(res.statusCode).toBe(500)
      })
    })

    describe('flujo completo con entidad', () => {
      it('cambia la contraseña de una entidad exitosamente', async () => {
        await createEntity(app)

        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: ENTITY_FIXTURE.email, userType: 'entity' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }
        const otp = extractOtpFromToken(resetToken)

        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp, newPassword: 'EntidadNueva1@#.' }
        })
        expect(res.statusCode).toBe(200)
      })
    })

    describe('flujo completo con responsable', () => {
      it('cambia la contraseña de un responsable exitosamente', async () => {
        const entity = await createEntity(app)
        await createResponsible(app, entity.id)

        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: RESPONSIBLE_FIXTURE.email, userType: 'responsible' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }
        const otp = extractOtpFromToken(resetToken)

        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp, newPassword: 'ResponsableNuevo1@#.' }
        })
        expect(res.statusCode).toBe(200)
      })
    })

    describe('flujo completo con local adherido', () => {
      it('cambia la contraseña de un local adherido exitosamente', async () => {
        const entity = await createEntity(app)
        await createRewardPartner(app, entity.id)

        const forgotRes = await app.inject({
          method: 'POST',
          url: '/api/auth/forgot-password',
          body: { email: REWARD_PARTNER_FIXTURE.email, userType: 'reward-partner' }
        })
        const { resetToken } = forgotRes.json().data as { resetToken: string }
        const otp = extractOtpFromToken(resetToken)

        const res = await app.inject({
          method: 'POST',
          url: '/api/auth/reset-password',
          body: { resetToken, otp, newPassword: 'LocalNuevo1@#.' }
        })
        expect(res.statusCode).toBe(200)
      })
    })
  })
})
