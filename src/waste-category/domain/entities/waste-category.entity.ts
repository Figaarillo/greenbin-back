/* eslint-disable indent */
import { Collection, Entity, OneToMany, Property, t } from '@mikro-orm/postgresql'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteEntity from '../../../waste/domain/entities/waste.entity'
import WasteCategoryPayload from '../payloads/waste-category.payload'

@Entity({ tableName: 'waste_categories' })
class WasteCategoryEntity extends BaseEntity {
  @Property({ unique: true })
  name: string

  @Property()
  pointsPerWeight: number

  @Property({ type: t.text })
  description: string

  @Property({ type: t.float })
  co2: number

  @OneToMany(() => WasteEntity, waste => waste.category)
  wastes = new Collection<WasteEntity>(this)

  constructor(payload: WasteCategoryPayload) {
    super()
    this.name = payload.name
    this.pointsPerWeight = payload.pointsPerWeight
    this.description = payload.description
    this.co2 = payload.co2
  }

  update(payload: WasteCategoryPayload): void {
    if (payload.name !== '' || payload.name != null) this.name = payload.name
    if (payload.pointsPerWeight != null) this.pointsPerWeight = payload.pointsPerWeight
    if (payload.description !== '' || payload.description != null) this.description = payload.description
  }
}

export default WasteCategoryEntity
