import { describe, expect, it, vi } from 'vitest'
import UnifiedLoginUseCase from '../application/usecases/unified-login.usecase'
import { Roles } from '../domain/entities/role'
import type NeighborRepository from '../../neighbor/domain/repositories/neighbor.repository'
import type RewardPartnerRepository from '../../reward-partner/domain/repositories/reward-partner.repository'
import type ResponsibleRepository from '../../responsible/domain/repositories/responsible.repository'
import type EntityRepository from '../../entity/domain/repositories/entity.repository'

interface FakeMatch {
  id: string
  email: string
  role: Roles
  username?: string
  name?: string
  verifyPassword: ReturnType<typeof vi.fn>
}

function makeMatch(role: Roles, overrides: Partial<FakeMatch> = {}, valid = true): FakeMatch {
  const base = {
    id: `${role}-id`,
    email: `${role}@test.com`,
    role,
    verifyPassword: vi.fn(async () => valid)
  }

  // Mirrors the real entities: EntityEntity has NO `username` key at all (only `name`),
  // the other three have `username` and no `name`. Using `undefined` instead of omitting
  // the key would make `'username' in match` true even for entity, hiding a real bug.
  const identifier = role === Roles.ENTITY ? { name: `${role}-name` } : { username: `${role}-username` }

  return { ...base, ...identifier, ...overrides }
}

function makeRepos(overrides: {
  neighbor?: FakeMatch | null
  rewardPartner?: FakeMatch | null
  responsible?: FakeMatch | null
  entity?: FakeMatch | null
}): {
  neighborRepository: NeighborRepository
  rewardPartnerRepository: RewardPartnerRepository
  responsibleRepository: ResponsibleRepository
  entityRepository: EntityRepository
  findWithPasswordNeighbor: ReturnType<typeof vi.fn>
  findWithPasswordRewardPartner: ReturnType<typeof vi.fn>
  findResponsible: ReturnType<typeof vi.fn>
  findEntity: ReturnType<typeof vi.fn>
} {
  const findWithPasswordNeighbor = vi.fn(async () => overrides.neighbor ?? null)
  const findWithPasswordRewardPartner = vi.fn(async () => overrides.rewardPartner ?? null)
  const findResponsible = vi.fn(async () => overrides.responsible ?? null)
  const findEntity = vi.fn(async () => overrides.entity ?? null)

  return {
    neighborRepository: { findWithPassword: findWithPasswordNeighbor } as unknown as NeighborRepository,
    rewardPartnerRepository: { findWithPassword: findWithPasswordRewardPartner } as unknown as RewardPartnerRepository,
    responsibleRepository: { find: findResponsible } as unknown as ResponsibleRepository,
    entityRepository: { find: findEntity } as unknown as EntityRepository,
    findWithPasswordNeighbor,
    findWithPasswordRewardPartner,
    findResponsible,
    findEntity
  }
}

function makeUseCase(
  repos: ReturnType<typeof makeRepos>,
  verifyDummy: ReturnType<typeof vi.fn> = vi.fn(async () => false)
): UnifiedLoginUseCase {
  return new UnifiedLoginUseCase(
    repos.neighborRepository,
    repos.rewardPartnerRepository,
    repos.responsibleRepository,
    repos.entityRepository,
    verifyDummy
  )
}

describe('UnifiedLoginUseCase — unit tests', () => {
  describe('resolución por tabla', () => {
    it('resuelve un neighbor con credenciales válidas', async () => {
      const neighbor = makeMatch(Roles.NEIGHBOR)
      const repos = makeRepos({ neighbor })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'x@test.com', password: 'secret' })

      expect(result).toEqual({
        id: neighbor.id,
        username: neighbor.username,
        email: neighbor.email,
        role: Roles.NEIGHBOR
      })
    })

    it('resuelve un reward-partner con credenciales válidas', async () => {
      const rewardPartner = makeMatch(Roles.REWARD_PARTNER)
      const repos = makeRepos({ rewardPartner })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'x@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.REWARD_PARTNER)
      expect(result.id).toBe(rewardPartner.id)
    })

    it('resuelve un responsible (role=RESPONSIBLE) con credenciales válidas', async () => {
      const responsible = makeMatch(Roles.RESPONSIBLE)
      const repos = makeRepos({ responsible })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'x@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.RESPONSIBLE)
    })

    it('resuelve un admin (responsible con role=ADMIN) con credenciales válidas', async () => {
      const admin = makeMatch(Roles.ADMIN)
      const repos = makeRepos({ responsible: admin })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'x@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.ADMIN)
    })

    it('resuelve una entity con credenciales válidas, usando name como username', async () => {
      const entity = makeMatch(Roles.ENTITY)
      const repos = makeRepos({ entity })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'x@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.ENTITY)
      expect(result.username).toBe(entity.name)
    })

    it('busca entity por name cuando el login llega por username (Entity no tiene username)', async () => {
      const entity = makeMatch(Roles.ENTITY)
      const repos = makeRepos({ entity })
      const useCase = makeUseCase(repos)

      await useCase.exec({ username: 'entity-name-lookup', password: 'secret' })

      expect(repos.findEntity).toHaveBeenCalledWith({ name: 'entity-name-lookup' }, expect.anything())
    })
  })

  describe('precedencia determinística en colisión cross-table', () => {
    it('neighbor gana sobre rewardPartner, responsible y entity', async () => {
      const repos = makeRepos({
        neighbor: makeMatch(Roles.NEIGHBOR),
        rewardPartner: makeMatch(Roles.REWARD_PARTNER),
        responsible: makeMatch(Roles.RESPONSIBLE),
        entity: makeMatch(Roles.ENTITY)
      })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'colision@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.NEIGHBOR)
    })

    it('rewardPartner gana sobre responsible y entity cuando no hay neighbor', async () => {
      const repos = makeRepos({
        rewardPartner: makeMatch(Roles.REWARD_PARTNER),
        responsible: makeMatch(Roles.RESPONSIBLE),
        entity: makeMatch(Roles.ENTITY)
      })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'colision2@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.REWARD_PARTNER)
    })

    it('responsible gana sobre entity cuando solo esos dos matchean', async () => {
      const repos = makeRepos({
        responsible: makeMatch(Roles.RESPONSIBLE),
        entity: makeMatch(Roles.ENTITY)
      })
      const useCase = makeUseCase(repos)

      const result = await useCase.exec({ email: 'colision3@test.com', password: 'secret' })

      expect(result.role).toBe(Roles.RESPONSIBLE)
    })
  })

  describe('no hay salida temprana', () => {
    it('consulta las 4 tablas aunque neighbor matchee primero', async () => {
      const repos = makeRepos({ neighbor: makeMatch(Roles.NEIGHBOR) })
      const useCase = makeUseCase(repos)

      await useCase.exec({ email: 'x@test.com', password: 'secret' })

      expect(repos.findWithPasswordNeighbor).toHaveBeenCalledTimes(1)
      expect(repos.findWithPasswordRewardPartner).toHaveBeenCalledTimes(1)
      expect(repos.findResponsible).toHaveBeenCalledTimes(1)
      expect(repos.findEntity).toHaveBeenCalledTimes(1)
    })

    it('consulta las 4 tablas cuando ninguna matchea', async () => {
      const repos = makeRepos({})
      const useCase = makeUseCase(repos)

      await expect(useCase.exec({ email: 'nadie@test.com', password: 'secret' })).rejects.toThrow()

      expect(repos.findWithPasswordNeighbor).toHaveBeenCalledTimes(1)
      expect(repos.findWithPasswordRewardPartner).toHaveBeenCalledTimes(1)
      expect(repos.findResponsible).toHaveBeenCalledTimes(1)
      expect(repos.findEntity).toHaveBeenCalledTimes(1)
    })
  })

  describe('comparación de tiempo constante (anti-enumeración)', () => {
    it('ejecuta la comparación dummy cuando el email no existe en ninguna tabla', async () => {
      const repos = makeRepos({})
      const verifyDummy = vi.fn(async () => false)
      const useCase = makeUseCase(repos, verifyDummy)

      await expect(useCase.exec({ email: 'nadie@test.com', password: 'cualquiera' })).rejects.toThrow()

      expect(verifyDummy).toHaveBeenCalledTimes(1)
      expect(verifyDummy).toHaveBeenCalledWith(expect.any(String), 'cualquiera')
    })

    it('NO ejecuta la comparación dummy cuando hay match (aunque la password sea incorrecta)', async () => {
      const wrongPasswordMatch = makeMatch(Roles.NEIGHBOR, {}, false)
      const repos = makeRepos({ neighbor: wrongPasswordMatch })
      const verifyDummy = vi.fn(async () => false)
      const useCase = makeUseCase(repos, verifyDummy)

      await expect(useCase.exec({ email: 'x@test.com', password: 'incorrecta' })).rejects.toThrow()

      expect(verifyDummy).not.toHaveBeenCalled()
      expect(wrongPasswordMatch.verifyPassword).toHaveBeenCalledTimes(1)
    })

    it('password incorrecta contra cuenta existente y email inexistente lanzan EXACTAMENTE el mismo error genérico', async () => {
      const wrongPasswordMatch = makeMatch(Roles.ENTITY, {}, false)
      const reposWithMatch = makeRepos({ entity: wrongPasswordMatch })
      const reposNoMatch = makeRepos({})

      const useCaseWithMatch = makeUseCase(reposWithMatch)
      const useCaseNoMatch = makeUseCase(reposNoMatch)

      let matchError: Error | undefined
      let noMatchError: Error | undefined

      try {
        await useCaseWithMatch.exec({ email: 'x@test.com', password: 'incorrecta' })
      } catch (error) {
        matchError = error as Error
      }

      try {
        await useCaseNoMatch.exec({ email: 'nadie@test.com', password: 'incorrecta' })
      } catch (error) {
        noMatchError = error as Error
      }

      expect(matchError).toBeDefined()
      expect(noMatchError).toBeDefined()
      expect(matchError?.message).toBe(noMatchError?.message)
      expect((matchError as unknown as { code: number }).code).toBe((noMatchError as unknown as { code: number }).code)
    })
  })

  describe('validación de entrada', () => {
    it('lanza error si no se provee email ni username, sin consultar ninguna tabla', async () => {
      const repos = makeRepos({})
      const useCase = makeUseCase(repos)

      await expect(useCase.exec({ password: 'secret' })).rejects.toThrow()

      expect(repos.findWithPasswordNeighbor).not.toHaveBeenCalled()
      expect(repos.findWithPasswordRewardPartner).not.toHaveBeenCalled()
      expect(repos.findResponsible).not.toHaveBeenCalled()
      expect(repos.findEntity).not.toHaveBeenCalled()
    })
  })
})
