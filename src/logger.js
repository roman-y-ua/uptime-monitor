import { writeFile, appendFile, readFile, mkdir, open } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function ensureLogFile(logFile) {
  const dir = path.dirname(logFile);
  if (dir !== "." && !existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  if (!existsSync(logFile)) {
    // Use open with 'wx' to avoid overwriting if file is created between existsSync and writeFile
    try {
      const fileHandle = await open(logFile, "wx");
      await fileHandle.write("# Uptime Monitor Log\n\n");
      await fileHandle.close();
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      // If file already exists, do nothing
    }
  }
}

export async function appendLogLines(logFile, lines) {
  await appendFile(logFile, lines.join(""));
}

export async function getLastLines(logFile, lineCount) {
  const data = await readFile(logFile, "utf8");
  const lines = data
    .trim()
    .split("\n")
    .map((line) => line.trim());
  if (lines.length <= lineCount) return lines;
  return lines.slice(lines.length - lineCount);
}
