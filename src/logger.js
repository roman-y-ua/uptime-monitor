import {
  appendFile,
  readFile,
  mkdir,
  open,
  access,
  constants,
} from "fs/promises";
import path from "path";

export async function ensureLogFile(logFilePath) {
  const dir = path.dirname(logFilePath);

  // Ensure directory exists
  if (dir !== ".") {
    try {
      await access(dir, constants.F_OK);
    } catch {
      await mkdir(dir, { recursive: true });
    }
  }

  // Ensure file exists
  try {
    await access(logFilePath, constants.F_OK);
  } catch {
    // Use open with 'wx' to avoid race conditions
    try {
      const fileHandle = await open(logFilePath, "wx");
      await fileHandle.write("# Uptime Monitor Log\n\n");
      await fileHandle.close();
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      // If file already exists, do nothing
    }
  }
}

export async function appendLogLines(logFilePath, lines) {
  await appendFile(logFilePath, lines.join(""));
}

export async function getLastLines(logFilePath, lineCount) {
  const data = await readFile(logFilePath, "utf8");
  const lines = data
    .trim()
    .split("\n")
    .map((line) => line.trim());

  if (lines.length <= lineCount) return lines;

  return lines.slice(lines.length - lineCount);
}
