/* eslint-disable indent */
import { Collection, ManyToOne, OneToMany, Property } from '@mikro-orm/postgresql'
import GreenPointEntity from '../../../green-point/domain/entities/green-point.entity'
import NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import BaseEntity from '../../../shared/domain/entities/base.entity'
import WasteTransactionDetailEntity from '../../../waste-transaction-detail/domain/entities/waste-transaction-detail.entity'
import type WasteTransactionPayload from '../payloads/waste-transaction.payload'

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
  totalPoints: number

  @Property()
  date: Date

  constructor(payload: WasteTransactionPayload) {
    super()
    this.responsible = payload.responsible
    this.neighbor = payload.neighbor
    this.greenPoint = payload.greenPoint
    this.addTransactionDetail(payload.transactionDetails)
    this.totalPoints = 0
    this.date = new Date()
  }

  private addTransactionDetail(details: WasteTransactionDetailEntity[]): void {
    // eslint-disable-next-line array-callback-return
    details.map(detail => {
      this.transactionDetails.add(detail)
    })
  }

  caculateTotalPoints(): void {
    this.transactionDetails.map(detail => (this.totalPoints += detail.points))
  }
}

export default WasteTransactionEntity
