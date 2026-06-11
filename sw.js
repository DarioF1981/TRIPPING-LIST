const CACHE = "checklist-v2";
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

// ── Daily reminder logic ──────────────────────────────────────────────────────
let dailyTimer = null;

function msUntilNext9am() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(9, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

function scheduleDailyNotif(pct, departure) {
  if (dailyTimer) clearTimeout(dailyTimer);

  const fire = () => {
    // Check if already departed or 100%
    const today = new Date().toISOString().split("T")[0];
    if (departure && today >= departure) return; // trip started, stop
    if (pct >= 100) return;

    const daysLeft = departure
      ? Math.ceil((new Date(departure) - new Date()) / 86400000)
      : null;

    const body = daysLeft !== null
      ? `Hai completato il ${pct}% della checklist. Mancano ${daysLeft} giorn${daysLeft===1?"o":"i"} alla partenza!`
      : `Hai completato il ${pct}% della checklist. Continua a preparare la valigia!`;

    self.registration.showNotification("✈️ Lista viaggio in corso", {
      body,
      icon: "/icon.png",
      badge: "/icon.png",
      tag: "daily-reminder",
      renotify: true,
    });

    // Schedule next day
    dailyTimer = setTimeout(fire, msUntilNext9am());
  };

  dailyTimer = setTimeout(fire, msUntilNext9am());
}

self.addEventListener("message", e => {
  if (e.data?.type === "SCHEDULE_DAILY") {
    scheduleDailyNotif(e.data.pct, e.data.departure);
  }
  if (e.data?.type === "CANCEL_DAILY") {
    if (dailyTimer) { clearTimeout(dailyTimer); dailyTimer = null; }
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});
