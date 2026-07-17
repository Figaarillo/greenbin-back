import { describe, expect, it, vi } from 'vitest'
import type EmailService from '../../auth/application/service/email.service'
import { Roles } from '../../auth/domain/entities/role'
import NotificationDispatcher from '../application/service/notification-dispatcher.service'
import type PushNotificationService from '../application/service/push-notification.service'
import type RealtimeBroadcaster from '../domain/services/realtime-broadcaster'
import type FindOrCreateNotificationPreferenceUseCase from '../application/usecases/find-or-create-preference.usecase'
import type RegisterNotificationUseCase from '../application/usecases/register.usecase'
import { NotificationCategory } from '../domain/enums/notification-category.enum'
import NotificationPreferenceEntity from '../domain/entities/notification-preference.entity'

function makeDispatcher(
  findOrCreatePreference: Partial<FindOrCreateNotificationPreferenceUseCase>,
  registerNotification: Partial<RegisterNotificationUseCase>
): NotificationDispatcher {
  return new NotificationDispatcher(
    findOrCreatePreference as FindOrCreateNotificationPreferenceUseCase,
    registerNotification as RegisterNotificationUseCase,
    {} as unknown as EmailService,
    { sendToRecipient: vi.fn() } as unknown as PushNotificationService,
    { send: vi.fn() } as unknown as RealtimeBroadcaster
  )
}

const baseEvent = {
  recipientId: 'neighbor-1',
  recipientRole: Roles.NEIGHBOR,
  category: NotificationCategory.COUPON_PURCHASED,
  title: 'Cupón comprado',
  body: 'Compraste el cupón X'
}

describe('NotificationDispatcher — unit tests', () => {
  it('no dispara nada cuando la categoría está deshabilitada en la preferencia', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)
    preference.couponPurchased = false

    const registerExec = vi.fn()
    const sendEmail = vi.fn()
    const dispatcher = makeDispatcher({ exec: async () => preference }, { exec: registerExec })

    await dispatcher.dispatch({ ...baseEvent, sendEmail })

    expect(registerExec).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('registra la notificación in-app y envía el mail cuando la categoría está habilitada', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)

    const registerExec = vi.fn()
    const sendEmail = vi.fn()
    const dispatcher = makeDispatcher({ exec: async () => preference }, { exec: registerExec })

    await dispatcher.dispatch({ ...baseEvent, sendEmail })

    expect(registerExec).toHaveBeenCalledWith(
      expect.objectContaining({ recipientId: 'neighbor-1', category: NotificationCategory.COUPON_PURCHASED })
    )
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('si falla el registro in-app, igual intenta enviar el mail', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)
    const sendEmail = vi.fn()
    const dispatcher = makeDispatcher(
      { exec: async () => preference },
      {
        exec: async () => {
          throw new Error('DB caída')
        }
      }
    )

    await expect(dispatcher.dispatch({ ...baseEvent, sendEmail })).resolves.toBeUndefined()
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('si falla el envío del mail, dispatch() no lanza', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)
    const registerExec = vi.fn()
    const sendEmail = vi.fn(async () => {
      throw new Error('SMTP caído')
    })
    const dispatcher = makeDispatcher({ exec: async () => preference }, { exec: registerExec })

    await expect(dispatcher.dispatch({ ...baseEvent, sendEmail })).resolves.toBeUndefined()
    expect(registerExec).toHaveBeenCalledTimes(1)
  })

  it('si falla la lectura de preferencias, se asume habilitado y se notifica igual', async () => {
    const registerExec = vi.fn()
    const sendEmail = vi.fn()
    const dispatcher = makeDispatcher(
      {
        exec: async () => {
          throw new Error('no se pudo leer preferencias')
        }
      },
      { exec: registerExec }
    )

    await dispatcher.dispatch({ ...baseEvent, sendEmail })

    expect(registerExec).toHaveBeenCalledTimes(1)
    expect(sendEmail).toHaveBeenCalledTimes(1)
  })

  it('sin sendEmail, solo registra la notificación in-app', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)
    const registerExec = vi.fn()
    const dispatcher = makeDispatcher({ exec: async () => preference }, { exec: registerExec })

    await dispatcher.dispatch({ ...baseEvent })

    expect(registerExec).toHaveBeenCalledTimes(1)
  })

  it('con emailEnabled en false, registra in-app pero no envía el mail', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)
    preference.emailEnabled = false

    const registerExec = vi.fn()
    const sendEmail = vi.fn()
    const dispatcher = makeDispatcher({ exec: async () => preference }, { exec: registerExec })

    await dispatcher.dispatch({ ...baseEvent, sendEmail })

    expect(registerExec).toHaveBeenCalledTimes(1)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('con emailEnabled en false pero la categoría también deshabilitada, tampoco registra in-app', async () => {
    const preference = new NotificationPreferenceEntity('neighbor-1', Roles.NEIGHBOR)
    preference.emailEnabled = false
    preference.couponPurchased = false

    const registerExec = vi.fn()
    const sendEmail = vi.fn()
    const dispatcher = makeDispatcher({ exec: async () => preference }, { exec: registerExec })

    await dispatcher.dispatch({ ...baseEvent, sendEmail })

    expect(registerExec).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
