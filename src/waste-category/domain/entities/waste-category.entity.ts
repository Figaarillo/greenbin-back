/* eslint-disable indent */
import { Entity, Property, t } from '@mikro-orm/postgresql'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteCategoryPayload from '../payloads/waste-category.payload'

@Entity()
class WasteCategoryEntity extends BaseEntity {
  @Property({ unique: true })
  name: string

  @Property({ type: t.text })
  description: string

  constructor(payload: WasteCategoryPayload) {
    super()
    this.name = payload.name
    this.description = payload.description
  }

  update(description: string): void {
    if (description !== '' || description != null) this.description = description
  }
}

export default WasteCategoryEntity
