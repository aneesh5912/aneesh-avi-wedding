import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { events, wedding, getCountdownParts, createCalendar } from "../details.mjs";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const calendar = await readFile(new URL("../celebrations.ics", import.meta.url), "utf8");

test("includes only the four approved events on 11 and 12 December", () => {
  assert.equal(events.length, 4);
  assert.deepEqual(events.map(event => event.start.slice(0, 10)), ["2026-12-11", "2026-12-11", "2026-12-12", "2026-12-12"]);
  assert.deepEqual(events.map(event => event.start.slice(11, 16)), ["14:00", "19:00", "10:00", "18:00"]);
  assert.equal(events[3].description, "Followed by Varmala & Shaadi.");
  for (const event of events) {
    assert.ok(html.includes(`data-event="${event.id}"`));
    assert.ok(html.includes(`datetime="${event.start}"`));
  }
  assert.doesNotMatch(html, /Vidaai|Vidai|13 December|Sudeep|Swati|99099/i);
});

test("venue includes the requested landmark, and directions do not include From details", () => {
  assert.ok(html.includes(wedding.venue));
  assert.ok(html.includes("Near Vaishnodevi Circle"));
  assert.ok(html.includes("Ahmedabad, Gujarat"));
  assert.match(html, /maps\/search\/\?api=1&amp;query=Hillock\+Hotel\+Near\+Vaishnodevi\+Circle/);
});

test("countdown uses IST correctly and stays non-negative", () => {
  assert.deepEqual(getCountdownParts(Date.parse("2026-12-10T12:30:00+05:30")), { days: 1, hours: 1, minutes: 30, status: "upcoming" });
  assert.deepEqual(getCountdownParts(Date.parse(wedding.beginsAt)), { days: 0, hours: 0, minutes: 0, status: "celebrating" });
  assert.equal(getCountdownParts(Date.parse("2026-12-12T23:59:00+05:30")).status, "celebrating");
  assert.deepEqual(getCountdownParts(Date.parse(wedding.celebrationsEndAt)), { days: 0, hours: 0, minutes: 0, status: "celebrated" });
  assert.throws(() => getCountdownParts(NaN), RangeError);
});

test("downloadable calendar matches source event data and correct UTC offsets", () => {
  assert.equal(calendar, createCalendar());
  assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 4);
  assert.match(calendar, /DTSTART:20261211T083000Z/);
  assert.match(calendar, /DTSTART:20261211T133000Z/);
  assert.match(calendar, /DTSTART:20261212T043000Z/);
  assert.match(calendar, /DTSTART:20261212T123000Z/);
  assert.doesNotMatch(calendar, /DTEND|DURATION|20261213/);
  for (const line of createCalendar().split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75);
});

test("site resources resolve from the project root and from a GitHub Pages subpath", async () => {
  const resources = [...html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)].map(match => match[1]);
  for (const resource of resources) {
    await readFile(new URL(`../${resource}`, import.meta.url));
    assert.equal(new URL(resource, "https://example.github.io/wedding/").pathname, `/wedding/${resource.slice(2)}`);
  }
});

test("music requires an explicit gesture and calendar remains available without JavaScript", () => {
  assert.doesNotMatch(html, /\bautoplay\b/);
  assert.match(html, /href="\.\/celebrations\.ics" download=/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="Play invitation music"/);
});

test("soundtrack is a complete browser-compatible PCM WAV", async () => {
  const wav = await readFile(new URL("../assets/celebration.wav", import.meta.url));
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.toString("ascii", 8, 12), "WAVE");
  assert.equal(wav.readUInt16LE(20), 1);
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt32LE(24), 22050);
  const seconds = wav.readUInt32LE(40) / wav.readUInt32LE(28);
  assert.ok(seconds > 31.9 && seconds <= 32.1);
});

test("sharing artwork exists and search engines are asked not to index wedding details", async () => {
  const artwork = await readFile(new URL("../assets/share-card.jpg", import.meta.url));
  assert.equal(artwork.readUInt16BE(0), 0xffd8);
  const pageUrl = html.match(/og:url" content="(https:\/\/[^"]+)"/)?.[1];
  assert.ok(pageUrl);
  assert.ok(html.includes(`property="og:image" content="${new URL("assets/share-card.jpg", pageUrl)}"`));
  assert.match(html, /name="robots" content="noindex, nofollow"/);
});
