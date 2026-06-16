const CACHE = "checklist-v4";
const FILES = ["/", "/index.html", "/icon.png", "/manifest.json"];

self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())
));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => e.respondWith(
  caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const clone = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, clone));
    return res;
  }).catch(() => caches.match("/index.html")))
));

// ── Daily reminder ────────────────────────────────────────────────────────────
let dailyTimer = null;
let savedConfig = null;

function msUntilTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

function fireDailyNotif() {
  if (!savedConfig) return;
  const { pct, departure, notifyTime } = savedConfig;

  // Stop if departed or complete
  const today = new Date().toISOString().split("T")[0];
  if (departure && today >= departure) { dailyTimer = null; return; }
  if (pct >= 100) { dailyTimer = null; return; }

  const daysLeft = departure
    ? Math.max(0, Math.ceil((new Date(departure) - new Date()) / 86400000))
    : null;

  const body = daysLeft !== null
    ? `${pct}% completato · Mancano ${daysLeft} giorn${daysLeft === 1 ? "o" : "i"} alla partenza!`
    : `${pct}% completato · Continua a preparare la valigia!`;

  self.registration.showNotification("✈️ Lista viaggio in corso", {
    body,
    icon: "/icon.png",
    badge: "/icon.png",
    tag: "daily-reminder",
    renotify: true,
    requireInteraction: false,
  });

  // Schedule next day at same time
  dailyTimer = setTimeout(fireDailyNotif, msUntilTime(notifyTime) + 1000);
}

self.addEventListener("message", e => {
  if (e.data?.type === "SCHEDULE_DAILY") {
    savedConfig = {
      pct: e.data.pct,
      departure: e.data.departure,
      notifyTime: e.data.notifyTime || "09:00",
    };
    if (dailyTimer) clearTimeout(dailyTimer);
    dailyTimer = setTimeout(fireDailyNotif, msUntilTime(savedConfig.notifyTime));
  }
  if (e.data?.type === "CANCEL_DAILY") {
    if (dailyTimer) { clearTimeout(dailyTimer); dailyTimer = null; }
    savedConfig = null;
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});
