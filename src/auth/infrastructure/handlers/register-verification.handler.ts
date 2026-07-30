import { type FastifyReply, type FastifyRequest } from 'fastify'
import EmailService from '../../application/service/email.service'
import OtpService from '../../application/service/otp.service'
import HandleHTTPResponse from '../../../shared/utils/http.reply.util'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'

type RegistrableUserType = 'neighbor' | 'reward-partner'

class RegisterVerificationHandler {
  private readonly emailService: EmailService
  private readonly otpService: OtpService

  constructor(
    private readonly neighborRepository: NeighborRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository
  ) {
    this.emailService = new EmailService()
    this.otpService = new OtpService()
  }

  async requestOtp(req: FastifyRequest, rep: FastifyReply): Promise<void> {
    const { email, userType } = req.body as { email: string; userType: RegistrableUserType }

    if (!email || (userType !== 'neighbor' && userType !== 'reward-partner')) {
      HandleHTTPResponse.BadRequest(rep, 'Email y tipo de usuario son requeridos')
      return
    }

    const alreadyExists = await this.userExistsByEmail(email, userType)
    if (alreadyExists) {
      HandleHTTPResponse.BadRequest(rep, 'Ese email ya está registrado')
      return
    }

    const otp = this.otpService.generate()
    const registerToken = this.otpService.createToken(email, otp, userType)

    try {
      await this.emailService.sendRegistrationOtp(email, otp)
    } catch (error) {
      console.error('[RegisterVerification] Failed to send OTP email:', error)
      HandleHTTPResponse.InternalServerError(rep, 'No se pudo enviar el correo de verificación')
      return
    }

    HandleHTTPResponse.OK(rep, 'Código enviado al correo', { registerToken })
  }

  private async userExistsByEmail(email: string, userType: RegistrableUserType): Promise<boolean> {
    if (userType === 'neighbor') return (await this.neighborRepository.find({ email })) != null
    return (await this.rewardPartnerRepository.find({ email })) != null
  }
}

export default RegisterVerificationHandler
