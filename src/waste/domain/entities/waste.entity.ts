/* eslint-disable indent */
import { Collection, Entity, ManyToMany, ManyToOne, Property } from '@mikro-orm/core'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteCategoryEntity from '../../../waste-category/domain/entities/waste-category.entity'

@Entity({ tableName: 'wastes' })
class WasteEntity extends BaseEntity {
  @ManyToOne()
  category: WasteCategoryEntity

  @Property()
  points: number = 0

  @Property({ type: 'float' })
  weight: number

  @Property()
  pointsPerWeight: number

  @ManyToMany()
  neighbors = new Collection<NeighborEntity>(this)

  constructor(category: WasteCategoryEntity, weight: number, pointsPerWeight: number) {
    super()
    this.category = category
    this.weight = weight
    this.pointsPerWeight = pointsPerWeight
  }

  calculatePoints(): number {
    const points = this.pointsPerWeight * this.weight
    this.points = points
    return points
  }
}

export default WasteEntity
