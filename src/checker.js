import { getTimeInTimezoneWithOffset } from './time.js';

export async function checkSingleSite(url, { timeoutMs, timezone }) {
  const timestamp = getTimeInTimezoneWithOffset(timezone);
  const start = Date.now();

  let status = 0;
  let responseTimeSec = 0.0;
  let errorMessage = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "GitHub-Actions-Uptime-Monitor/1.0",
      },
    });
    status = res.status;
    responseTimeSec = (Date.now() - start) / 1000;
  } catch (error) {
    status = 0;
    responseTimeSec = (Date.now() - start) / 1000;
    errorMessage = error.name === "AbortError" ? "Timeout" : error.message;
  } finally {
    clearTimeout(timeoutId);
  }

  return { url, status, responseTimeSec, errorMessage, timestamp };
}

function createErrorResult(url, timezone, reason) {
  return {
    url,
    status: 0,
    responseTimeSec: 0,
    errorMessage: reason?.message || "Unknown error",
    timestamp: getTimeInTimezoneWithOffset(timezone),
  };
}

export async function checkSites(
  sites,
  { timeoutMs = 15000, maxConcurrent = 5, timezone = "UTC" } = {}
) {
  const results = [];

  for (let i = 0; i < sites.length; i += maxConcurrent) {
    const batch = sites.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map((url) => checkSingleSite(url, { timeoutMs, timezone }))
    );

    batchResults.forEach((result, j) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        results.push(createErrorResult(batch[j], timezone, result.reason));
      }
    });
  }

  return results;
}
