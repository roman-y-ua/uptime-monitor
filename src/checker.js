import { getTimeInTimezoneWithOffset } from './time.js';

export async function checkSites(sites, { timeoutMs, maxConcurrent, timezone }) {
  async function checkSingle(url) {
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

  const results = [];
  for (let i = 0; i < sites.length; i += maxConcurrent) {
    const batch = sites.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(
      batch.map((url) => checkSingle(url))
    );
    for (const r of batchResults) {
      results.push(
        r.value || {
          url: null,
          status: 0,
          responseTimeSec: 0,
          errorMessage: r.reason?.message || "Unknown error",
          timestamp: getTimeInTimezoneWithOffset(timezone),
        }
      );
    }
  }
  return results;
}
