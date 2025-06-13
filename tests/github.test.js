import { describe, it, expect, vi } from 'vitest'
import { createIssue } from '../src/github.js'

describe('createIssue', () => {
  it('calls octokit.rest.issues.create with correct params', async () => {
    const mockCreate = vi.fn()
    const octokit = { rest: { issues: { create: mockCreate } } }
    await createIssue(octokit, 'owner', 'repo', 'title', 'body')
    expect(mockCreate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'title',
      body: 'body'
    })
  })
})