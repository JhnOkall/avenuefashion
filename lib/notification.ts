/**
 * Utility function to convert a VAPID public key string to a Uint8Array.
 */
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  /**
   * Registers the service worker and subscribes the user to push notifications.
   * Sends the subscription object to the backend server.
   */
  export async function subscribeUserToPush() {
    // Register the service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
  
    // Check for an existing subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("User is already subscribed.");
      return;
    }
  
    // Get the VAPID public key from environment variables
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      throw new Error("VAPID public key not found in environment variables.");
    }
  
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  
    // Subscribe the user
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  
    // Send the subscription to your backend
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });
  }