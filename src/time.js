export function getTimeInTimezoneWithOffset(tz) {
  if (tz.toUpperCase() === "UTC") {
    const d = new Date();
    return d.toISOString().split(".")[0] + "+00:00";
  }

  if (typeof globalThis.Temporal?.Now === "function") {
    try {
      const zdt = globalThis.Temporal.Now.zonedDateTimeISO(tz);
      return zdt
        .toString()
        .replace(/\.\d+/, "")
        .replace(/\u2212/g, "-")
        .split("[")[0];
    } catch {
      // Invalid IANA tz → fall back to Intl below
    }
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz }).format(new Date());
  } catch {
    const d = new Date();
    return d.toISOString().split(".")[0] + "+00:00";
  }

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
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

  const values = {};
  for (const part of parts) {
    if (
      [
        "year",
        "month",
        "day",
        "hour",
        "minute",
        "second",
        "timeZoneName",
      ].includes(part.type)
    ) {
      values[part.type] = part.value;
    }
  }

  const dateTime = `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
  const offset = values.timeZoneName.replace("GMT", "").replace(/\u2212/g, "-");
  return dateTime + offset;
}
