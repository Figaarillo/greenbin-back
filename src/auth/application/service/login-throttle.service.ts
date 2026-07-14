import type ThrottleStore from '../../domain/repositories/throttle-store.repository'
import ErrorTooManyLoginAttempts from '../../domain/errors/too-many-login-attempts.error'

const DEFAULT_MAX_ATTEMPTS = 5

// Unified rate-limit/lockout for POST /api/auth/login, replacing the fragmented per-role
// limits on the 5 legacy endpoints. `check()` increments the attempt counter for `key`
// (AuthHandler uses `${email}:${ip}`) BEFORE the login attempt runs, so a client that is
// already locked out never reaches UnifiedLoginUseCase — this increment doubles as the
// "count this attempt" step regardless of whether the login that follows succeeds or
// fails. `recordSuccess()` clears the counter on a successful login so legitimate access
// doesn't count against future attempts.
class LoginThrottleService {
  constructor(
    private readonly store: ThrottleStore,
    private readonly maxAttempts: number = DEFAULT_MAX_ATTEMPTS
  ) {}

  async check(key: string): Promise<void> {
    const attempts = await this.store.hit(key)
    if (attempts > this.maxAttempts) {
      throw new ErrorTooManyLoginAttempts()
    }
  }

  async recordSuccess(key: string): Promise<void> {
    await this.store.reset(key)
  }
}

export default LoginThrottleService
