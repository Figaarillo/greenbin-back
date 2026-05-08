import type { CouponTransactionState, CouponTransactionStateContext } from './coupon-transaction-state.interface'
import { CouponTransactionStatus, createStateFromStatus } from './coupon-transaction-states'

export class CouponTransactionStateMachine implements CouponTransactionStateContext {
  private state: CouponTransactionState

  constructor(initialStatus: CouponTransactionStatus = CouponTransactionStatus.ADQUIRIDO) {
    this.state = createStateFromStatus(initialStatus)
  }

  getStatus(): CouponTransactionStatus {
    return this.state.status
  }

  getState(): CouponTransactionState {
    return this.state
  }

  setState(state: CouponTransactionState): void {
    this.state = state
  }

  getExpirationDate(): Date {
    return this._expirationDate
  }

  setExpirationDate(date: Date): void {
    this._expirationDate = date
  }

  private _expirationDate: Date = new Date()

  use(): void {
    if (!this.state.canUse()) {
      throw new Error('El cupón no puede ser utilizado en su estado actual')
    }

    const now = new Date()
    if (now > this._expirationDate) {
      this.expire()
      throw new Error('El cupón ha expirado')
    }

    this.state.use(this)
  }

  expire(): void {
    if (!this.state.canExpire()) {
      throw new Error('El cupón no puede expirar en su estado actual')
    }

    this.state.expire(this)
  }

  canUse(): boolean {
    const now = new Date()
    if (now > this._expirationDate && this.state.canExpire()) {
      this.expire()
      return false
    }
    return this.state.canUse()
  }

  isExpired(): boolean {
    const now = new Date()
    if (now > this._expirationDate && this.state.canExpire()) {
      this.expire()
      return true
    }
    return this.state.status === CouponTransactionStatus.EXPIRADO
  }
}
