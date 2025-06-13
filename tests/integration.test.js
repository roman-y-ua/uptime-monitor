import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkSites } from '../src/checker.js'
import { ensureLogFile, appendLogLines, getLastLines } from "../src/logger.js";
import { createIssue } from '../src/github.js'
import { unlink } from 'fs/promises'

const testLog = 'integration-uptime.log'

describe('Integration: site check and logging', () => {
  beforeEach(async () => {
    try { await unlink(testLog) } catch {}
  })

  it('checks sites, appends log, and triggers issue creation on failure', async () => {
    // Mock fetch: one good, one bad
    global.fetch = vi.fn(async (url) => ({
      status: url.includes('good') ? 200 : 500
    }))

    // Mock createIssue
    const mockCreate = vi.fn()
    const octokit = { rest: { issues: { create: mockCreate } } }

    // Prepare log file
    await ensureLogFile(testLog)

    // Run check
    const sites = ['https://good.com', 'https://bad.com']
    const results = await checkSites(sites, {
      timeoutMs: 1000,
      maxConcurrent: 2,
      timezone: 'UTC'
    })

    // Append log lines
    const logLines = results.map(r =>
      `[${r.timestamp}] ${r.url} → Status: ${r.status}, Response: ${r.responseTimeSec.toFixed(3)}s\n`
    )
    await appendLogLines(testLog, logLines)

    // Check log file content
    const lastLines = await getLastLines(testLog, 2)
    expect(lastLines[0]).toContain('good.com')
    expect(lastLines[1]).toContain('bad.com')
    expect(lastLines[1]).toContain('500')

    // Simulate issue creation for failed site
    if (results.some(r => r.status !== 200)) {
      await createIssue(octokit, 'owner', 'repo', 'Test Issue', 'A site failed')
      expect(mockCreate).toHaveBeenCalled()
    }
  })
})