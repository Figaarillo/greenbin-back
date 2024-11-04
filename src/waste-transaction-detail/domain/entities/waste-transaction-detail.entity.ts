/* eslint-disable indent */
import { Entity, ManyToOne, Property } from '@mikro-orm/core'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteEntity from '../../../waste/domain/entities/waste.entity'
import WasteTransactionDetailPayload from '../payloads/waste-transaction-detail.payload'
import WasteTransactionEntity from '../../../waste-transaction/domain/entities/waste-transaction.entity'

@Entity({ tableName: 'wastes_transactions_details' })
class WasteTransactionDetailEntity extends BaseEntity {
  @ManyToOne(() => WasteEntity)
  waste: WasteEntity

  @Property()
  pointsPerWeight: number = 0

  @Property()
  points: number = 0

  @ManyToOne(() => WasteTransactionEntity)
  transaction: WasteTransactionEntity

  constructor(payload: WasteTransactionDetailPayload) {
    super()
    this.waste = payload.waste
    this.transaction = payload.transaction
  }

  setPointsPerWeight(): void {
    this.pointsPerWeight = this.waste.pointsPerWeight
  }

  setPoints(): void {
    this.points = this.waste.calculatePoints()
  }
}

export default WasteTransactionDetailEntity
