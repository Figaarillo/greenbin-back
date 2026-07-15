import { z } from 'zod'

// Los unicos push services donde un browser real termina registrando una
// subscription. Sin este allowlist, "endpoint" es una URL arbitraria que
// push-notification.service.ts llama por su cuenta con cada notificacion
// futura: cualquier usuario notificable podria registrar un host interno de
// la red (SSRF a demanda, repetible).
const ALLOWED_PUSH_HOSTS = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com']

const isAllowedPushEndpoint = (endpoint: string): boolean => {
  const { protocol, hostname } = new URL(endpoint)
  if (protocol !== 'https:') return false
  return ALLOWED_PUSH_HOSTS.some(host => hostname === host || hostname.endsWith(`.${host}`))
}

const SubscribePushDTO = z.object({
  endpoint: z.string().url().refine(isAllowedPushEndpoint, {
    message: 'Endpoint is not a recognized push service'
  }),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  })
})

export default SubscribePushDTO
