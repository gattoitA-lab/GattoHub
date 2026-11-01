/* GattoHub - service worker: rete prima, copia salvata se sei offline. */
const C = "gattohub-v1";
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then((c) => c.addAll(["./", "manifest.webmanifest", "icon-192.png"])).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || /\/api(\/|$)/.test(u.pathname)) return;
  e.respondWith(
    fetch(r).then((res) => {
      if (res.ok && (r.mode === "navigate" || /\.(png|webp|webmanifest)$/.test(u.pathname))) {
        const cp = res.clone();
        caches.open(C).then((c) => c.put(r.mode === "navigate" ? self.registration.scope : r, cp));
      }
      return res;
    }).catch(() => caches.match(r.mode === "navigate" ? self.registration.scope : r).then((m) => m || caches.match(self.registration.scope)))
  );
});
