import type { FastifyReply } from 'fastify'
import type { Roles } from '../../../auth/domain/entities/role'
import type RealtimeBroadcaster from '../../domain/services/realtime-broadcaster'
import type { RealtimeEvent } from '../../domain/services/realtime-broadcaster'

// Singleton de modulo (una sola instancia para todo el proceso): tanto la
// ruta /stream (que registra conexiones abiertas) como el NotificationDispatcher
// (que las usa para emitir) necesitan ver el MISMO mapa de conexiones, aunque
// cada bootstrap construya su propio dispatcher por request. Por eso esta
// clase se exporta ya instanciada, no como algo para instanciar de nuevo.
class SseConnectionRegistry implements RealtimeBroadcaster {
  private readonly connections = new Map<string, Set<FastifyReply>>()

  subscribe(recipientId: string, recipientRole: Roles, reply: FastifyReply): void {
    const key = this.keyFor(recipientId, recipientRole)
    const existing = this.connections.get(key)
    if (existing != null) {
      existing.add(reply)
      return
    }
    this.connections.set(key, new Set([reply]))
  }

  unsubscribe(recipientId: string, recipientRole: Roles, reply: FastifyReply): void {
    const key = this.keyFor(recipientId, recipientRole)
    const existing = this.connections.get(key)
    if (existing == null) return

    existing.delete(reply)
    if (existing.size === 0) this.connections.delete(key)
  }

  send(recipientId: string, recipientRole: Roles, event: RealtimeEvent): void {
    const key = this.keyFor(recipientId, recipientRole)
    const replies = this.connections.get(key)
    if (replies == null || replies.size === 0) return

    const payload = `data: ${JSON.stringify(event)}\n\n`
    for (const reply of replies) {
      reply.raw.write(payload)
    }
  }

  private keyFor(recipientId: string, recipientRole: Roles): string {
    return `${recipientRole}:${recipientId}`
  }
}

const sseConnectionRegistry = new SseConnectionRegistry()

export default sseConnectionRegistry
export { SseConnectionRegistry }
