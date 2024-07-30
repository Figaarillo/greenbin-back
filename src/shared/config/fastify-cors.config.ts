import { type OriginFunction } from '@fastify/cors'

const allowedOrigins: string[] = ['localhost']

const origin: OriginFunction = (origin, cb) => {
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
  // methods: ['...'], default: GET,HEAD,PUT,PATCH,POST,DELETE
  allowedHeaders: ['Content-Type', 'Authorization'],
  // exposedHeaders: ['X-My-Custom-Header'],
  credentials: true,
  maxAge: 86400 // 24 hours
}
