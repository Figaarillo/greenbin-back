import { type OriginFunction } from '@fastify/cors'
import EnvVar from './env-var.config'

// Tolerates CORS_ALLOWED_ORIGINS entries configured with a scheme/trailing slash
// (e.g. "https://greenbin.up.railway.app/") by reducing everything to the bare hostname.
function toHostname(value: string): string {
  const trimmed = value.trim()
  try {
    return new URL(trimmed).hostname
  } catch {
    return trimmed
  }
}

const allowedOrigins: string[] = EnvVar.cors.allowedOrigins.map(toHostname)

// Requests with no Origin header (curl, server-to-server, same-origin) are only trusted outside production.
const origin: OriginFunction = (origin, cb) => {
  if (origin === undefined) {
    cb(null, true)
    return
  }

  if (typeof origin !== 'string') {
    cb(new Error('Origin is undefined'), false)
    return
  }

  const hostname = new URL(origin).hostname
  if (allowedOrigins.includes(hostname)) {
    cb(null, true)
    return
  }

  cb(new Error('Origin not allowed'), false)
}

export const FastifyCorsConfig = {
  origin,
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}
