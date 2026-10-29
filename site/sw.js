const CACHE = "sidnote-v47";
const LIB = "sidnote-lib-2"; // lecteur PDF (pdf.js), gardé entre les versions
const FILES = ["./", "./index.html", "./app.css", "./design.css", "./fonts.css", "./i18n.js", "./exercices.js", "./exercices-aide.js", "./app.js", "./manifest.webmanifest", "./icons/home.svg", "./icons/agenda.svg", "./icons/fit.svg", "./icons/note.svg", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./logo-180.png", "./logo-192.png", "./logo-512.png", "./logo-32.png", "./favicon.svg", "./maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== LIB).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour recevoir les mises à jour), cache si hors connexion
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  // v43 : lecteur PDF et polices hébergés sur le site ; cache d'abord, pour lire les documents et garder les polices hors connexion
  if (u.origin === self.location.origin && (u.pathname.includes("/lib/pdfjs/") || u.pathname.includes("/fonts/"))) {
    e.respondWith(caches.open(LIB).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }))));
    return;
  }
  if (u.origin !== self.location.origin) return; // jamais de cache pour le serveur de comptes
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});

// Rappels envoyés par le serveur
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || "sid'note", {
    body: d.body || "",
    icon: "logo-192.png",
    badge: "logo-192.png",
    tag: d.tag,
    data: { url: d.url || "./" }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.location.href).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return clients.openWindow(url);
  }));
});
