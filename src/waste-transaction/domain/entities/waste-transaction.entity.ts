/* eslint-disable indent */
import { Collection, Entity, ManyToOne, OneToMany, Property } from '@mikro-orm/postgresql'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteTransactionDetailEntity from '../../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'

@Entity({ tableName: 'wastes_transactions' })
class WasteTransactionEntity extends BaseEntity {
  @ManyToOne()
  responsible: ResponsibleEntity

  @ManyToOne()
  neighbor: NeighborEntity

  @ManyToOne()
  greenPoint: GreenPointEntity

  @OneToMany(() => WasteTransactionDetailEntity, detail => detail.transaction)
  transactionDetails = new Collection<WasteTransactionDetailEntity>(this)

  @Property()
  totalPoints: number = 0

  @Property()
  date: Date = new Date()

  constructor(responsible: ResponsibleEntity, neighbor: NeighborEntity, greenPoint: GreenPointEntity) {
    super()
    this.responsible = responsible
    this.neighbor = neighbor
    this.greenPoint = greenPoint
  }

  addTransactionDetail(detail: WasteTransactionDetailEntity): void {
    this.transactionDetails.add(detail)
    this.totalPoints += detail.points
  }

  calculateTotalPoints(): number {
    this.totalPoints = this.transactionDetails.getItems().reduce((sum, detail) => sum + detail.points, 0)

    return this.totalPoints
  }
}

export default WasteTransactionEntity
