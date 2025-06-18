/**
 * Service Worker for Avenue Fashion
 * Handles push notifications in the background.
 */

// Listen for the 'push' event.
self.addEventListener("push", (event) => {
  let data = {};
  let title = "Avenue Fashion";
  let body = "";
  let url = "/";

  // Check if there's any data in the push message
  if (event.data) {
    try {
      // Try to parse as JSON first
      data = event.data.json();
      title = data.title || "Avenue Fashion";
      body = data.body || "";
      url = data.url || "/";
    } catch (error) {
      // If JSON parsing fails, treat it as plain text
      console.log("Push data is not JSON, treating as plain text");
      body = event.data.text();
      // You can also try to extract title from the text if needed
      // For example, if the format is "Title: Body"
      if (body.includes(":")) {
        const parts = body.split(":", 2);
        title = parts[0].trim();
        body = parts[1].trim();
      }
    }
  }

  const options = {
    body: body,
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png", // Added missing leading slash
    data: {
      url: url,
    },
    // Additional options for better UX
    requireInteraction: false,
    silent: false,
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

// Activate event to ensure the service worker takes control of all pages
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
