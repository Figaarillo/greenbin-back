import { describe, expect, it } from 'vitest'
import SubscribePushDTO from '../infrastructure/dtos/subscribe-push.dto'

function payload(endpoint: string): unknown {
  return { endpoint, keys: { p256dh: 'p256dh-key', auth: 'auth-key' } }
}

describe('SubscribePushDTO — unit tests', () => {
  it('acepta un endpoint real de FCM', () => {
    expect(() => SubscribePushDTO.parse(payload('https://fcm.googleapis.com/fcm/send/abc'))).not.toThrow()
  })

  it('acepta un endpoint real de Mozilla autopush', () => {
    expect(() =>
      SubscribePushDTO.parse(payload('https://updates.push.services.mozilla.com/wpush/v2/abc'))
    ).not.toThrow()
  })

  it('rechaza un host que no es un push service conocido (SSRF)', () => {
    expect(() => SubscribePushDTO.parse(payload('https://10.0.0.5/fcm/send/abc'))).toThrow()
  })

  it('rechaza un dominio que solo contiene el nombre del host permitido', () => {
    expect(() => SubscribePushDTO.parse(payload('https://fcm.googleapis.com.evil.com/x'))).toThrow()
  })

  it('rechaza un endpoint http, aunque el host sea válido', () => {
    expect(() => SubscribePushDTO.parse(payload('http://fcm.googleapis.com/fcm/send/abc'))).toThrow()
  })
})
