import { describe, it, expect } from 'vitest'
import { getTimeInTimezoneWithOffset } from '../src/time.js'

describe('getTimeInTimezoneWithOffset', () => {
  it('returns UTC time in correct format', () => {
    const result = getTimeInTimezoneWithOffset('UTC')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/)
  })

  it('returns offset for valid timezone', () => {
    const result = getTimeInTimezoneWithOffset('America/New_York')
    expect(result).toMatch(/[\+\-]\d{2}:\d{2}$/);
  })

  it('falls back to UTC for invalid timezone', () => {
    const result = getTimeInTimezoneWithOffset('Invalid/Timezone')
    expect(result.endsWith('+00:00')).toBe(true)
  })
})
