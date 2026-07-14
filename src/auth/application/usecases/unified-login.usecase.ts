import { hash, verify } from 'argon2'
import ErrorInvalidCredentialsProvided from '../../../shared/domain/errors/invalid-credentials.error'
import ErrorMissingFields from '../../../shared/domain/errors/missing-filds.error'
import { type Roles } from '../../domain/entities/role'
import type NeighborEntity from '../../../neighbor/domain/entities/neighbor.entity'
import type NeighborRepository from '../../../neighbor/domain/repositories/neighbor.repository'
import type RewardPartnerEntity from '../../../reward-partner/domain/entities/reward-partner.entity'
import type RewardPartnerRepository from '../../../reward-partner/domain/repositories/reward-partner.repository'
import type ResponsibleEntity from '../../../responsible/domain/entities/responsible.entity'
import type ResponsibleRepository from '../../../responsible/domain/repositories/responsible.repository'
import ResponsibleRelationships from '../../../responsible/domain/enums/responsible-relationships.enum'
import type EntityEntity from '../../../entity/domain/entities/entity.entity'
import type EntityRepository from '../../../entity/domain/repositories/entity.repository'
import { EntityRelationships } from '../../../entity/domain/enums/entity.enum'

export interface UnifiedLoginPayload {
  email?: string
  username?: string
  password: string
}

export interface UnifiedLoginResult {
  id: string
  username: string
  email: string
  role: Roles
}

// Injectable seam so unit tests can assert the dummy-hash comparison path runs without
// paying real argon2 cost per test. Defaults to argon2's real `verify` in production —
// the bootstrap wiring never overrides it.
export type PasswordVerifier = (hashedPassword: string, plainPassword: string) => Promise<boolean>

type MatchedIdentity = NeighborEntity | RewardPartnerEntity | ResponsibleEntity | EntityEntity

// Computed once per process (memoized): a real argon2 hash of a value nobody will ever
// submit as a password. Used ONLY on the "no match in any of the 4 tables" path, so that
// branch performs comparable argon2 work to the "match found, wrong password" branch —
// see design.md (Architecture Decisions > Identity resolution) and spec.md (Constant-time
// comparison requirement).
let dummyHashPromise: Promise<string> | null = null
async function getDummyHash(): Promise<string> {
  if (dummyHashPromise == null) {
    dummyHashPromise = hash('unified-login-dummy-password-never-submitted-by-a-real-user')
  }
  return await dummyHashPromise
}

class UnifiedLoginUseCase {
  constructor(
    private readonly neighborRepository: NeighborRepository,
    private readonly rewardPartnerRepository: RewardPartnerRepository,
    private readonly responsibleRepository: ResponsibleRepository,
    private readonly entityRepository: EntityRepository,
    private readonly verifyDummy: PasswordVerifier = verify
  ) {}

  async exec(payload: UnifiedLoginPayload): Promise<UnifiedLoginResult> {
    const query = this.buildQuery(payload)

    // Sequential, NO early-exit: every request touches all 4 tables regardless of where
    // (or whether) a match is found. This flattens response time across "email doesn't
    // exist anywhere" and "email exists in table N" — see design.md (Identity resolution).
    const neighbor = await this.neighborRepository.findWithPassword(query)
    const rewardPartner = await this.rewardPartnerRepository.findWithPassword(query)
    const responsible = await this.responsibleRepository.find(query, [ResponsibleRelationships.PASSWORD])
    const entity = await this.findEntity(query)

    // Deterministic precedence when the same email exists in more than one table:
    // neighbor > rewardPartner > responsible (covers RESPONSIBLE and ADMIN via the row's
    // `role` column — admin is not a separate table) > entity.
    const match: MatchedIdentity | null = neighbor ?? rewardPartner ?? responsible ?? entity

    // Exactly ONE password comparison per request: against the matched record, or against
    // a precomputed dummy hash when nothing matched. Both branches run comparable argon2
    // work, so "not found" and "wrong password" are indistinguishable by timing or message.
    const passwordValid =
      match != null
        ? await match.verifyPassword(payload.password)
        : await this.verifyDummy(await getDummyHash(), payload.password)

    if (match == null || !passwordValid) {
      // Same generic error/message regardless of WHY it failed — never reveals which
      // table matched, or whether any account matched at all.
      throw new ErrorInvalidCredentialsProvided()
    }

    return this.toResult(match)
  }

  private buildQuery(payload: UnifiedLoginPayload): Record<string, string> {
    if (payload.email != null && payload.email !== '') {
      return { email: payload.email }
    }
    if (payload.username != null && payload.username !== '') {
      return { username: payload.username }
    }
    throw new ErrorMissingFields(['email', 'username'])
  }

  // EntityEntity has no `username` field — its human-facing identifier is `name`.
  private async findEntity(query: Record<string, string>): Promise<EntityEntity | null> {
    if (query.email != null) {
      return await this.entityRepository.find({ email: query.email }, [EntityRelationships.PASSWORD])
    }
    return await this.entityRepository.find({ name: query.username }, [EntityRelationships.PASSWORD])
  }

  private toResult(match: MatchedIdentity): UnifiedLoginResult {
    const username = 'username' in match ? match.username : match.name
    return { id: match.id, username, email: match.email, role: match.role }
  }
}

export default UnifiedLoginUseCase
