/* eslint-disable indent */
import { Entity, ManyToOne, Property, t } from '@mikro-orm/core'
import BaseGreenPoint from '../../../shared/domain/entities/base.entity'
import GreenPointPayload from '../payloads/green-point.payload'
import type GreenPointUpdatePayload from '../payloads/green-point.update.payload'
import EntityEntity from '../../../entity/domain/entities/entity.entity'

@Entity()
class GreenPointEntity extends BaseGreenPoint {
  @Property()
  name: string

  @Property()
  email: string

  @Property()
  phoneNumber: string

  @Property({ type: t.text })
  description: string

  @Property()
  address: string

  @Property({ unique: true, type: t.json })
  coordinates: {
    latitude: number
    longitude: number
  }

  @ManyToOne(() => EntityEntity)
  entity: EntityEntity

  constructor(payload: GreenPointPayload, entity: EntityEntity) {
    super()
    this.name = payload.name
    this.email = payload.email
    this.phoneNumber = payload.phoneNumber
    this.description = payload.description
    this.address = payload.address
    this.coordinates = payload.coordinates
    this.entity = entity
  }

  update(payload: GreenPointUpdatePayload): void {
    if (payload.name !== '' || payload.name != null) this.name = payload.name
    if (payload.email !== '' || payload.email != null) this.email = payload.email
    if (payload.phoneNumber !== '' || payload.phoneNumber != null) this.phoneNumber = payload.phoneNumber
    if (payload.description !== '' || payload.description != null) this.description = payload.description
  }
}

export default GreenPointEntity
