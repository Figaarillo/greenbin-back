import type CouponRepository from '../../domain/repositories/coupon.repository'
// import CouponStatus from '../../domain/entities/coupon.entity';

export class GenerateRedemptionCodeUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(couponId: string, _neighborId: string): Promise<string> {
    // 1. Buscar el cupón y verificar que pertenece al vecino
    const coupon = await this.couponRepository.find({ id: couponId })

    if (coupon === null || coupon.state !== 'AVAILABLE') {
      throw new Error('El cupón no existe o no está disponible.')
    }
    // (Opcional: aquí verificas si neighborId coincide con el dueño del cupón)

    // 2. Generar código alfanumérico de 6 caracteres (mayúsculas y números)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // 3. Actualizar la entidad
    coupon.redemptionCode = code
    coupon.state = 'PENDING'

    // 4. Guardar en la base de datos
    await this.couponRepository.save(coupon)

    return code
  }
}
