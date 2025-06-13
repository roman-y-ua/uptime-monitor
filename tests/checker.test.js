import { describe, it, expect, vi } from 'vitest'
import { checkSites } from '../src/checker.js'

global.fetch = vi.fn(async (url) => ({
  status: url.includes('good') ? 200 : 500
}))

describe('checkSites', () => {
  it('returns status for each site', async () => {
    const sites = ['https://good.com', 'https://bad.com']
    const results = await checkSites(sites, {
      timeoutMs: 1000,
      maxConcurrent: 2,
      timezone: 'UTC'
    })
    expect(results).toHaveLength(2)
    expect(results[0]).toHaveProperty('status')
    expect(results[1]).toHaveProperty('status')
  })

  it('marks failed sites', async () => {
    const sites = ['https://bad.com']
    const results = await checkSites(sites, {
      timeoutMs: 1000,
      maxConcurrent: 1,
      timezone: 'UTC'
    })
    expect(results[0].status).toBe(500)
  })
})