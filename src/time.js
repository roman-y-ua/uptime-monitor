const DATE_PART_TYPES = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "timeZoneName",
];

/**
 * Returns the current date-time string in the specified IANA timezone,
 * formatted as ISO 8601 with offset (e.g., "2025-06-16T12:34:56+02:00").
 * Falls back to UTC if the timezone is invalid or unsupported.
 * @param {string} timezone - IANA timezone string (e.g., "Europe/Paris")
 * @returns {string} ISO 8601 date-time string with offset
 */
export function getTimeInTimezoneWithOffset(timezone) {
  if (timezone.toUpperCase() === "UTC") {
    const date = new Date();
    return date.toISOString().split(".")[0] + "+00:00";
  }

  // Try Temporal API if available
  if (typeof globalThis.Temporal?.Now === "function") {
    try {
      const zonedDateTime = globalThis.Temporal.Now.zonedDateTimeISO(timezone);
      return zonedDateTime
        .toString()
        .replace(/\.\d+/, "")
        .replace(/\u2212/g, "-")
        .split("[")[0];
    } catch {
      // Invalid IANA timezone, fall back to Intl below
    }
  }

  // Try Intl.DateTimeFormat to validate timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone }).format(new Date());
  } catch {
    // Invalid timezone, fall back to UTC
    const date = new Date();
    return date.toISOString().split(".")[0] + "+00:00";
  }

  // Format using Intl.DateTimeFormat with offset
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(new Date());

  const dateParts = {};
  for (const part of parts) {
    if (DATE_PART_TYPES.includes(part.type)) {
      dateParts[part.type] = part.value;
    }
  }

  const dateTime = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
  const offset = dateParts.timeZoneName
    .replace("GMT", "")
    .replace(/\u2212/g, "-");

  return dateTime + offset;
}
