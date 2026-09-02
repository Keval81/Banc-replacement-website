self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith("banc-pwa-"))
        .map((cacheName) => caches.delete(cacheName)),
    );

    // Take control of open tabs without reloading them.
    await self.clients.claim();
  })());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      tag: data.tag || "default",
      requireInteraction: data.requireInteraction || false,
      data: data.data || {},
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: "window" });
    const existingClient = windowClients.find(
      (client) => client.url === targetUrl && "focus" in client,
    );
    if (existingClient) {
      await existingClient.focus();
      return;
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});
