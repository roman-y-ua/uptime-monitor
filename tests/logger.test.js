import { describe, it, expect, beforeEach } from 'vitest'
import { ensureLogFile, appendLogLines, getLastLines } from '../src/logger.js'
import { unlink } from 'fs/promises'

const testLog = 'test-uptime.log'

describe('logger', () => {
  beforeEach(async () => {
    try {
      await unlink(testLog);
    } catch {}
  });

  it("creates a new log file", async () => {
    await ensureLogFile(testLog);
    const lines = await getLastLines(testLog, 1);
    expect(lines[0]).toContain("Uptime Monitor Log");
  });

  it("appends lines and reads last lines", async () => {
    await ensureLogFile(testLog);
    await appendLogLines(testLog, ["line1\n", "line2\n"]);
    const lines = await getLastLines(testLog, 2);
    expect(lines).toEqual(["line1", "line2"]);
  });
})