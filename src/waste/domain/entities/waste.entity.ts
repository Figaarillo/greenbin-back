/* eslint-disable indent */
import { Collection, Entity, ManyToMany, ManyToOne, Property } from '@mikro-orm/core'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'
import WastePayload from '../payloads/waste.payload'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'

@Entity({ tableName: 'wastes' })
class WasteEntity extends BaseEntity {
  @ManyToOne()
  category: WasteCategoryEntity

  @Property()
  points: number

  @Property()
  weight: number

  @Property()
  pointsPerWeight: number

  @ManyToMany()
  neighbors = new Collection<NeighborEntity>(this)

  constructor(payload: WastePayload) {
    super()
    this.category = payload.category
    this.weight = payload.weight
    this.points = 0
    this.pointsPerWeight = payload.pointsPerWeight
  }

  calculatePoints(): number {
    const points = this.pointsPerWeight * this.weight
    this.points = points
    return points
  }
}

export default WasteEntity
