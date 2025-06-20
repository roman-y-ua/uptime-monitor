import { exec } from "@actions/exec";

export function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatLogLine({
  timestamp,
  url,
  status,
  responseTimeSec,
  errorMessage,
}) {
  const base = `[${timestamp}] ${url} → Status: ${status}, Response: ${responseTimeSec.toFixed(
    3
  )}s`;

  return errorMessage ? `${base}, Error: ${errorMessage}\n` : `${base}\n`;
}

/**
 * Checks if a file is ignored by git.
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function isGitIgnored(filePath) {
  let output = "";
  await exec("git", ["check-ignore", filePath], {
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        output += data.toString();
      },
    },
  });

  const isIgnored = output.trim() === filePath;

  return isIgnored;
}
