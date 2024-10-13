/* eslint-disable indent */
import { Entity, Property, t } from '@mikro-orm/core'
import BaseGreenPoint from '../../../shared/domain/entities/base.entity'
import GreenPointPayload from '../payloads/green-point.payload'
import type GreenPointUpdatePayload from '../payloads/green-point.update.payload'

@Entity()
class GreenPointEntity extends BaseGreenPoint {
  @Property()
  name: string

  @Property({ type: t.text })
  description: string

  @Property()
  address: string

  @Property({ unique: true })
  coordinates: {
    latitude: number
    longitude: number
  }

  constructor(payload: GreenPointPayload) {
    super()
    this.name = payload.name
    this.description = payload.description
    this.address = payload.address
    this.coordinates = payload.coordinates
  }

  update(payload: GreenPointUpdatePayload): void {
    if (payload.description !== '' || payload.description != null) this.description = payload.description
    if (payload.name !== '' || payload.name != null) this.name = payload.name
  }
}

export default GreenPointEntity
