import WasteEntity from '../../domain/entities/waste.entity'
import ErrorCannotSaveWaste from '../../domain/errors/cannot-save-waste.error'
import type WastePayload from '../../domain/payloads/waste.payload'
import type WasteRepository from '../../domain/repositories/waste.repository'

class RegisterWasteUseCase {
  constructor(private readonly repository: WasteRepository) {}

  async exec(payload: WastePayload): Promise<WasteEntity> {
    const newWaste = new WasteEntity(payload)

    const waste = await this.repository.save(newWaste)
    if (waste == null) {
      throw new ErrorCannotSaveWaste()
    }

    return waste
  }
}

export default RegisterWasteUseCase
