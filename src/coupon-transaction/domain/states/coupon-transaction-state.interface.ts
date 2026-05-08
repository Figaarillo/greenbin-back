export enum CouponTransactionStatus {
  ADQUIRIDO = 'ADQUIRIDO',
  USADO = 'USADO',
  EXPIRADO = 'EXPIRADO'
}

export interface CouponTransactionState {
  readonly status: CouponTransactionStatus

  canUse: () => boolean
  canExpire: () => boolean
  use: (context: CouponTransactionStateContext) => void
  expire: (context: CouponTransactionStateContext) => void
}

export interface CouponTransactionStateContext {
  setState: (state: CouponTransactionState) => void
  getStatus: () => CouponTransactionStatus
  getExpirationDate: () => Date
}
