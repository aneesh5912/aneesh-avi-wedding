export const wedding = Object.freeze({
  names: "Aneesh & Avi",
  venue: "Hillock Hotel",
  address: "Near Vaishnodevi Circle, Ahmedabad, Gujarat",
  beginsAt: "2026-12-11T14:00:00+05:30",
  celebrationsEndAt: "2026-12-13T00:00:00+05:30",
});

export const events = Object.freeze([
  { id: "tilak", title: "Tilak Ceremony", start: "2026-12-11T14:00:00+05:30", description: "" },
  { id: "sangeet", title: "Ring Ceremony & Sangeet", start: "2026-12-11T19:00:00+05:30", description: "" },
  { id: "haldi", title: "Haldi Ceremony", start: "2026-12-12T10:00:00+05:30", description: "" },
  { id: "baraat", title: "Baraat", start: "2026-12-12T18:00:00+05:30", description: "Followed by Varmala & Shaadi." },
].map(Object.freeze));

export function getCountdownParts(now = Date.now()) {
  const current = Number(now);
  if (!Number.isFinite(current)) throw new RangeError("Countdown requires a valid timestamp.");
  const remaining = Math.max(0, Date.parse(wedding.beginsAt) - current);
  const totalMinutes = Math.floor(remaining / 60_000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
    status: remaining > 0 ? "upcoming"
      : current < Date.parse(wedding.celebrationsEndAt) ? "celebrating" : "celebrated",
  };
}

function escapeCalendar(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n")
    .replaceAll(",", "\\,").replaceAll(";", "\\;");
}

export function createCalendar() {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aneesh and Avi//Wedding Celebrations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const event of events) {
    const utc = new Date(event.start).toISOString().replaceAll(/[-:]/g, "").replace(".000", "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:aneesh-avi-2026-${event.id}@invitation.local`,
      "DTSTAMP:20261119T000000Z",
      `DTSTART:${utc}`,
      `SUMMARY:${escapeCalendar(`${wedding.names} - ${event.title}`)}`,
      `LOCATION:${escapeCalendar(`${wedding.venue}, ${wedding.address}`)}`,
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeCalendar(event.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  // Calendar content lines are folded at 73 ASCII characters, below the 75-octet limit.
  return lines.flatMap(line => {
    const folded = [];
    while (line.length > 73) {
      folded.push(line.slice(0, 73));
      line = ` ${line.slice(73)}`;
    }
    folded.push(line);
    return folded;
  }).join("\r\n") + "\r\n";
}
