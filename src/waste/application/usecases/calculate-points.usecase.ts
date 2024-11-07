import type WasteEntity from '../../domain/entities/waste.entity'

class CalculatePointsUseCase {
  exec(waste: WasteEntity): number {
    return waste.calculatePoints()
  }
}

export default CalculatePointsUseCase
