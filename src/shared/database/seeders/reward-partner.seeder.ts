/* eslint-disable no-console */
import { type EntityManager } from '@mikro-orm/postgresql'
import RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'

const REWARD_PARTNER_SEEDS = [
  {
    name: 'Supermercado Etruria',
    username: 'super_etruria',
    address: 'Av. San Martín 250, Etruria',
    cuit: '30-71234567-2',
    email: 'canje@superetruria.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3535-420001',
    coordinates: { latitude: -32.939123, longitude: -63.243456 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Pollería Santa Lucía',
    username: 'poll_santalucia',
    address: 'Calle Belgrano 410, Etruria',
    cuit: '27-24567890-1',
    email: 'canje@polleriasantalucia.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3535-420002',
    coordinates: { latitude: -32.938745, longitude: -63.244987 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Verdulería Silveira',
    username: 'verd_silveira',
    address: 'Calle Rivadavia 175, Etruria',
    cuit: '20-18765432-6',
    email: 'canje@verduleriasilveira.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3535-420003',
    coordinates: { latitude: -32.938251, longitude: -63.243812 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  },
  {
    name: 'Bar La Cabra',
    username: 'bar_lacabra',
    address: 'Bv. Sarmiento 320, Etruria',
    cuit: '30-70987654-8',
    email: 'canje@barlacabra.com.ar',
    password: 'Partner2024!',
    phoneNumber: '3535-420004',
    coordinates: { latitude: -32.944015, longitude: -63.248631 },
    entityId: '',
    entityEmail: 'muniEtruria@gmail.com'
  }
]

async function seedRewardPartners(em: EntityManager, entities: EntityEntity[]): Promise<RewardPartnerEntity[]> {
  const existing = await em.count(RewardPartnerEntity)
  if (existing > 0) {
    console.log(`[Seeder] RewardPartner: ya existen ${existing} registros, se omite.`)
    return await em.find(RewardPartnerEntity, {})
  }

  const entityMap = new Map(entities.map(e => [e.email, e]))

  const partners = REWARD_PARTNER_SEEDS.map(({ entityEmail, ...data }) => {
    const entity = entityMap.get(entityEmail)
    if (entity == null) throw new Error(`[Seeder] Entity no encontrada: ${entityEmail}`)
    return new RewardPartnerEntity(data, entity)
  })

  await em.persistAndFlush(partners)
  console.log(`[Seeder] RewardPartner: ${partners.length} reward partners creados.`)
  return partners
}

export default seedRewardPartners
