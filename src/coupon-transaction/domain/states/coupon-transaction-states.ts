/* eslint-disable indent */
import type { CouponTransactionState, CouponTransactionStateContext } from './coupon-transaction-state.interface'
import { CouponTransactionStatus } from './coupon-transaction-state.interface'

export { CouponTransactionStatus }

export class AcquiredState implements CouponTransactionState {
  readonly status: CouponTransactionStatus = CouponTransactionStatus.ADQUIRIDO

  canUse(): boolean {
    return true
  }

  canExpire(): boolean {
    return true
  }

  use(context: CouponTransactionStateContext): void {
    context.setState(new UsedState())
  }

  expire(context: CouponTransactionStateContext): void {
    context.setState(new ExpiredState())
  }
}

export class UsedState implements CouponTransactionState {
  readonly status: CouponTransactionStatus = CouponTransactionStatus.USADO

  canUse(): boolean {
    return false
  }

  canExpire(): boolean {
    return false
  }

  use(): void {
    throw new Error('El cupón ya ha sido utilizado')
  }

  expire(): void {
    throw new Error('El cupón ya ha sido utilizado y no puede expirar')
  }
}

export class ExpiredState implements CouponTransactionState {
  readonly status: CouponTransactionStatus = CouponTransactionStatus.EXPIRADO

  canUse(): boolean {
    return false
  }

  canExpire(): boolean {
    return false
  }

  use(): void {
    throw new Error('El cupón ha expirado y no puede ser utilizado')
  }

  expire(): void {
    throw new Error('El cupón ya ha expirado')
  }
}

export function createStateFromStatus(status: CouponTransactionStatus): CouponTransactionState {
  switch (status) {
    case CouponTransactionStatus.ADQUIRIDO:
      return new AcquiredState()
    case CouponTransactionStatus.USADO:
      return new UsedState()
    case CouponTransactionStatus.EXPIRADO:
      return new ExpiredState()
    default:
      throw new Error(`Estado desconocido: ${String(status)}`)
  }
}
