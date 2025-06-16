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
  const base = `[${timestamp}] ${url} → Status: ${status}, Response: ${responseTimeSec.toFixed(3)}s`;
  return errorMessage ? `${base}, Error: ${errorMessage}\n` : `${base}\n`;
}