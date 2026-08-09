import type ThrottleStore from '../../domain/repositories/throttle-store.repository'

interface ThrottleEntry {
  count: number
  expiresAt: number
}

const DEFAULT_TTL_MS = 15 * 60 * 1000 // 15 minutos

// In-memory Map+TTL implementation of ThrottleStore. Per-process only — a multi-instance
// deploy needs a shared store (e.g. Redis) to keep lockout state consistent across
// instances; tracked as a follow-up (see design.md > Open Questions). Swappable behind
// the ThrottleStore interface without touching LoginThrottleService.
class InMemoryThrottleStoreRepository implements ThrottleStore {
  private readonly entries = new Map<string, ThrottleEntry>()

  constructor(private readonly ttlMs: number = DEFAULT_TTL_MS) {}

  async hit(key: string): Promise<number> {
    const now = Date.now()
    const existing = this.entries.get(key)

    if (existing == null || existing.expiresAt <= now) {
      this.entries.set(key, { count: 1, expiresAt: now + this.ttlMs })
      return 1
    }

    existing.count += 1
    return existing.count
  }

  async reset(key: string): Promise<void> {
    this.entries.delete(key)
  }
}

export default InMemoryThrottleStoreRepository
