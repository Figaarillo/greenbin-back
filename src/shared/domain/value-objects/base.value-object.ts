import { v4 as uuidv4 } from 'uuid'

export class Id {
  private readonly _value: string

  constructor() {
    this._value = uuidv4()
  }

  get value(): string {
    return this._value
  }
}

export class CreateAt {
  private readonly _value: Date

  constructor() {
    this._value = new Date()
  }

  get value(): Date {
    return this._value
  }
}

export class UpdateAt {
  private readonly _value: Date

  constructor() {
    this._value = new Date()
  }

  get value(): Date {
    return this._value
  }
}
