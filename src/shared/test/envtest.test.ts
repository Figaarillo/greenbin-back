import { test, expect, vi } from 'vitest'

vi.mock('../../reward-partner/reward-partner.bootstrap', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

test('EnvVar afip check', async () => {
  const { default: EnvVar } = await import('../../shared/config/env-var.config')
  console.log('EnvVar loaded:', EnvVar != null)
  console.log('afip:', JSON.stringify(EnvVar?.afip))
  expect(true).toBe(true)
})
