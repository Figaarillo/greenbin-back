import { type FastifyReply, type FastifyRequest } from 'fastify'
import EmailService from '../../application/service/email.service'
import OtpService from '../../application/service/otp.service'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import type ResponsibleRepository from '../../../responsible/domain/repositories/responsible.repository'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'

type UserType = 'entity' | 'neighbor' | 'responsible' | 'reward-partner'

class PasswordResetHandler {
  private readonly emailService: EmailService
  private readonly otpService: OtpService

  constructor(
    private readonly entityRepository: EntityRepository,
    private readonly neighborRepository: NeighborRepository,
    private readonly responsibleRepository: ResponsibleRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository
  ) {
    this.emailService = new EmailService()
    this.otpService = new OtpService()
  }

  async forgotPassword(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { email, userType } = req.body as { email: string; userType: UserType }

    const exists = await this.userExistsByEmail(email, userType)
    if (!exists) {
      // Respuesta genérica para no revelar si el email existe
      HandleHTTPResponse.OK(rep, 'Si el email existe, recibirás un código en tu correo')
      return
    }

    const otp = this.otpService.generate()
    const token = this.otpService.createToken(email, otp, userType)

    await this.emailService.sendPasswordResetOtp(email, otp)

    HandleHTTPResponse.OK(rep, 'Código enviado al correo', { resetToken: token })
  }

  async resetPassword(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { resetToken, otp, newPassword } = req.body as {
      resetToken: string
      otp: string
      newPassword: string
    }

    const payload = this.otpService.verify(resetToken, otp)

    const changed = await this.changeUserPassword(payload.email, payload.userType as UserType, newPassword)

    if (!changed) {
      HandleHTTPResponse.NotFound(rep, 'Usuario no encontrado')
      return
    }

    HandleHTTPResponse.OK(rep, 'Contraseña actualizada exitosamente')
  }

  private async userExistsByEmail(email: string, userType: UserType): Promise<boolean> {
    if (userType === 'entity') return (await this.entityRepository.find({ email })) != null
    if (userType === 'neighbor') return (await this.neighborRepository.find({ email })) != null
    if (userType === 'responsible') return (await this.responsibleRepository.find({ email })) != null
    return (await this.rewardPartnerRepository.find({ email })) != null
  }

  private async changeUserPassword(email: string, userType: UserType, newPassword: string): Promise<boolean> {
    if (userType === 'entity') return await this.entityRepository.changePassword(email, newPassword)
    if (userType === 'neighbor') return await this.neighborRepository.changePassword(email, newPassword)
    if (userType === 'responsible') return await this.responsibleRepository.changePassword(email, newPassword)
    return await this.rewardPartnerRepository.changePassword(email, newPassword)
  }
}

export default PasswordResetHandler
