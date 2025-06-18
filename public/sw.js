/**
 * Service Worker for Avenue Fashion
 * Handles push notifications in the background.
 */

// Listen for the 'push' event.
self.addEventListener("push", (event) => {
  // Retrieve the notification data from the push message.
  const data = event.data.json();
  const title = data.title || "Avenue Fashion";
  const options = {
    body: data.body,
    icon: "/web-app-manifest-192x192.png",
    badge: "web-app-manifest-192x192.png",
    data: {
      url: data.url || "/",
    },
  };

  // Keep the service worker alive until the notification is shown.
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for the 'notificationclick' event.
self.addEventListener("notificationclick", (event) => {
  // Close the notification.
  event.notification.close();

  // Open the app and focus on the relevant page.
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If a window is already open, focus it.
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window.
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// A simple install event to ensure the service worker takes control immediately.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
