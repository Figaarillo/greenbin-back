// Swappable storage for login rate-limiting/lockout counters, keyed by an opaque string
// (unified login uses `${email}:${ip}`). Default implementation is in-memory; a future
// multi-instance deploy can swap in a Redis-backed implementation without touching
// LoginThrottleService or AuthHandler.
interface ThrottleStore {
  hit: (key: string) => Promise<number>
  reset: (key: string) => Promise<void>
}

export default ThrottleStore
