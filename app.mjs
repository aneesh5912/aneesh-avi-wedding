import { getCountdownParts } from "./details.mjs";

const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const opening = document.querySelector(".opening");
const header = document.querySelector(".site-header");
const secondDay = document.querySelector(".second-day");
const secondDayNumber = secondDay.querySelector(".day-number");
const scheduleDiyas = secondDay.querySelector(".schedule-diyas");
const venue = document.querySelector(".venue-section");
const venueArt = venue.querySelector(".venue-art");
const venueTitle = document.querySelector("#venue-title");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = value => value * value * (3 - 2 * value);
const enter = (top, start, end) => clamp((start - top / innerHeight) / (start - end));
let scrollPending = false;
let lastScroll = scrollY;
let petalImpulse = 0;
let openingTop = 0;
let openingTravel = 1;
let documentTravel = 1;
let venueTop = 0;
let venueHeight = 1;
let marigoldProgress = 0;

function measure() {
  openingTop = opening.getBoundingClientRect().top + scrollY;
  openingTravel = Math.max(1, opening.offsetHeight - innerHeight);
  documentTravel = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  venueTop = venue.getBoundingClientRect().top + scrollY;
  venueHeight = venue.offsetHeight;
  updateScroll();
}

function lightDiyas(section, progress) {
  section.style.setProperty("--diya-left", smooth(progress).toFixed(4));
  section.style.setProperty("--diya-right", smooth(clamp((progress - .18) / .82)).toFixed(4));
}

function updateScroll() {
  const dayProgress = reducedMotion.matches ? 1 : enter(secondDayNumber.getBoundingClientRect().top, .9, .52);
  const scheduleDiyaProgress = reducedMotion.matches ? 1 : enter(scheduleDiyas.getBoundingClientRect().top, .94, .64);
  const artProgress = reducedMotion.matches ? 1 : enter(venueArt.getBoundingClientRect().top, .93, .38);
  const titleProgress = reducedMotion.matches ? 1 : enter(venueTitle.getBoundingClientRect().top, .89, .64);
  marigoldProgress = reducedMotion.matches ? 0 : enter(secondDay.getBoundingClientRect().top, .92, .23);
  const openingProgress = reducedMotion.matches ? 1 : clamp((scrollY - openingTop) / (openingTravel * .74));
  const reveal = reducedMotion.matches ? 1 : smooth(clamp((openingProgress - .18) / .56));
  root.style.setProperty("--open", smooth(openingProgress).toFixed(4));
  root.style.setProperty("--hero-reveal", reveal.toFixed(4));
  root.style.setProperty("--seal-opacity", (1 - smooth(clamp(openingProgress / .5))).toFixed(4));
  root.style.setProperty("--scroll", clamp(scrollY / documentTravel).toFixed(5));
  header.classList.toggle("is-visible", openingProgress > .94 || reducedMotion.matches);
  secondDay.style.setProperty("--day-reveal", smooth(dayProgress).toFixed(4));
  venue.style.setProperty("--venue-title-reveal", smooth(titleProgress).toFixed(4));
  lightDiyas(scheduleDiyas, scheduleDiyaProgress);
  lightDiyas(venue, artProgress);
  if (!reducedMotion.matches) {
    const venueProgress = clamp((scrollY + innerHeight - venueTop) / (innerHeight + venueHeight));
    venue.style.setProperty("--venue-offset", `${((venueProgress - .5) * 112).toFixed(1)}px`);
    petalImpulse = Math.min(7, Math.abs(scrollY - lastScroll) * .075);
  }
  lastScroll = scrollY;
  scrollPending = false;
}

addEventListener("scroll", () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateScroll);
  }
}, { passive: true });
addEventListener("resize", measure, { passive: true });
addEventListener("pageshow", measure);
document.querySelectorAll(".opening img").forEach(image => image.addEventListener("load", measure, { once: true }));

if ("IntersectionObserver" in window) {
  const reveals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        reveals.unobserve(entry.target);
      }
    }
  }, { threshold: .12, rootMargin: "0px 0px -15px 0px" });
  document.querySelectorAll(".reveal").forEach(element => reveals.observe(element));
} else {
  document.querySelectorAll(".reveal").forEach(element => element.classList.add("is-revealed"));
}

const countdown = document.querySelector(".countdown");
const countdownMessage = document.querySelector(".countdown-message");
function updateCountdown() {
  const value = getCountdownParts();
  countdown.hidden = value.status !== "upcoming";
  countdownMessage.hidden = value.status === "upcoming";
  if (value.status === "upcoming") {
    for (const key of ["days", "hours", "minutes"]) {
      document.getElementById(key).textContent = String(value[key]).padStart(2, "0");
    }
  } else {
    countdownMessage.textContent = value.status === "celebrating"
      ? "The celebrations are here!"
      : "Two days of celebration. A lifetime of love.";
  }
}
updateCountdown();
setInterval(updateCountdown, 30_000);

const canvas = document.querySelector("#petals");
const context = canvas.getContext("2d");
let petals = [];
let petalFrame = 0;
let previousTime = 0;
let viewportWidth = innerWidth;
let viewportHeight = innerHeight;

function paintPetal(x, y, size, rotation, width, color, opacity) {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.scale(width, 1);
  context.globalAlpha = opacity;
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(-size, 0);
  context.bezierCurveTo(-size, -size * 1.6, size, -size * 1.2, size * 1.2, 0);
  context.bezierCurveTo(size * .5, size, -size * .8, size, -size, 0);
  context.fill();
  context.restore();
}

function drawMarigolds() {
  if (marigoldProgress <= 0 || marigoldProgress >= 1) return;
  const colors = ["#d88320", "#eea628", "#f7bd4c"];
  const count = viewportWidth < 600 ? 26 : 40;
  for (let i = 0; i < count; i++) {
    // Positions depend on scroll, so the shower rewinds naturally when scrolling up.
    const fall = clamp((marigoldProgress - (i % 7) * .046) / .69);
    if (fall <= 0 || fall >= 1) continue;
    const x = viewportWidth * (.06 + ((i * .618) % 1) * .88) + Math.sin(i * 2 + fall * 5) * (12 + fall * 22);
    const y = viewportHeight * (.04 + fall * (.63 + (i % 6) * .068));
    const opacity = .72 * smooth(clamp(fall * 8)) * smooth(clamp((1 - fall) * 4));
    paintPetal(x, y, 4 + (i % 5) * .8, i + fall * 9,
      .35 + Math.abs(Math.sin(i + fall * 8)) * .65, colors[i % colors.length], opacity);
  }
}

function resizePetals() {
  viewportWidth = innerWidth;
  viewportHeight = innerHeight;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(viewportWidth * ratio);
  canvas.height = Math.round(viewportHeight * ratio);
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = viewportWidth < 600 ? 18 : 32;
  petals = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * viewportWidth,
    y: Math.random() * viewportHeight,
    size: 2 + Math.random() * 3.2,
    speed: .32 + Math.random() * .52,
    rotation: Math.random() * Math.PI * 2,
    phase: index * 2.4,
    color: index % 4 === 0 ? "#c3974f" : "#b66e75",
  }));
}

function drawPetals(time) {
  if (document.hidden || reducedMotion.matches || !context) {
    petalFrame = 0;
    previousTime = 0;
    return;
  }
  const delta = previousTime ? Math.min((time - previousTime) / 16.67, 3) : 1;
  previousTime = time;
  context.clearRect(0, 0, viewportWidth, viewportHeight);
  const openingDone = scrollY > openingTravel * .15;
  for (const petal of petals) {
    petal.y += (petal.speed + petalImpulse * .3) * delta;
    petal.x += (Math.sin(time * .00045 + petal.phase) * .25 + .08) * delta;
    petal.rotation += .012 * delta;
    if (petal.y > viewportHeight + 20) { petal.y = -20; petal.x = Math.random() * viewportWidth; }
    if (petal.x > viewportWidth + 20) petal.x = -20;
    paintPetal(petal.x, petal.y, petal.size, petal.rotation,
      .3 + Math.abs(Math.sin(time * .001 + petal.phase)) * .7, petal.color, openingDone ? .38 : .14);
  }
  drawMarigolds();
  petalImpulse *= .94;
  petalFrame = requestAnimationFrame(drawPetals);
}

function startPetals() {
  if (!petalFrame && !reducedMotion.matches && !document.hidden && context) {
    petalFrame = requestAnimationFrame(drawPetals);
  }
}
function motionPreferenceChanged() {
  if (petalFrame) cancelAnimationFrame(petalFrame);
  petalFrame = 0;
  previousTime = 0;
  context?.clearRect(0, 0, viewportWidth, viewportHeight);
  measure();
  startPetals();
}
reducedMotion.addEventListener("change", motionPreferenceChanged);
addEventListener("resize", resizePetals, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (document.hidden && petalFrame) {
    cancelAnimationFrame(petalFrame);
    petalFrame = 0;
    previousTime = 0;
  } else {
    updateCountdown();
    startPetals();
  }
});

const audio = document.querySelector("#invitation-music");
const musicButton = document.querySelector(".music-toggle");
const musicLabel = document.querySelector(".music-label");
const musicStatus = document.querySelector("#music-status");
let musicNotice;

function syncMusicButton() {
  const playing = !audio.paused && !audio.ended;
  musicButton.setAttribute("aria-pressed", String(playing));
  musicButton.setAttribute("aria-label", playing ? "Pause invitation music" : "Play invitation music");
  musicLabel.textContent = playing ? "Music on" : "Music off";
}
function reportMusicError(error) {
  console.error("Invitation music could not play:", error);
  const message = "Music couldn't play. Please tap the music button to try again.";
  musicStatus.textContent = message;
  if (!musicNotice) {
    musicNotice = document.createElement("p");
    musicNotice.className = "music-notice";
    musicNotice.setAttribute("role", "alert");
    document.body.append(musicNotice);
  }
  musicNotice.textContent = message;
  musicNotice.hidden = false;
}
musicButton.hidden = false;
audio.volume = .65;
musicButton.addEventListener("click", async () => {
  if (!audio.paused) { audio.pause(); return; }
  musicButton.disabled = true;
  musicStatus.textContent = "";
  if (musicNotice) musicNotice.hidden = true;
  try {
    await audio.play();
  } catch (error) {
    reportMusicError(error);
  } finally {
    musicButton.disabled = false;
    syncMusicButton();
  }
});
audio.addEventListener("play", syncMusicButton);
audio.addEventListener("pause", syncMusicButton);
audio.addEventListener("error", () => reportMusicError(audio.error));

root.classList.add("js");
resizePetals();
measure();
startPetals();
