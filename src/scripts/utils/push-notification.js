import CONFIG from '../config.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

class PushNotificationManager {
  constructor() {
    this.registration = null;
    this.isSubscribed = false;
  }


  async _getRegistration() {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }
    return this.registration;
  }

  async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await this._getRegistration();

        // Check if already subscribed
        const subscription = await registration.pushManager.getSubscription();
        this.isSubscribed = !!subscription;

       
        return true;
      } catch (error) {
        console.error('Push notification initialization failed:', error);
        return false;
      }
    }
    return false;
  }

  async subscribe() {
    try {
     
      const registration = await this._getRegistration();
      
      const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'));
      const auth = arrayBufferToBase64(subscription.getKey('auth'));
      const endpoint = subscription.endpoint;

      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint,
          keys: {
            p256dh,
            auth
          }
        })
      });

      if (response.ok) {
        this.isSubscribed = true;
        console.log('Successfully subscribed to push notifications');
        return true;
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      return false;
    }
  }

  async unsubscribe() {
    try {
      const registration = await this._getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const endpoint = subscription.endpoint;

        const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ endpoint })
        });

        if (response.ok) {
          await subscription.unsubscribe();
          this.isSubscribed = false;
          console.log('Successfully unsubscribed from push notifications');
          return true;
        }
      }
    } catch (error) {
      console.error('Unsubscription failed:', error);
      return false;
    }
  }

  getSubscriptionStatus() {
    return this.isSubscribed;
  }

  async sendNotification(title, body, icon = '/favicon.png', storyId = null) {
    const registration = await this._getRegistration();
    if (registration) {
      const options = {
        body: body,
        icon: icon,
        badge: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
          storyId: storyId,
          dateOfArrival: Date.now()
        },
        actions: [
          { action: 'view', title: 'Lihat Cerita' },
          { action: 'close', title: 'Tutup' }
        ]
      };

      await registration.showNotification(title, options);
    }
  }
}

export default PushNotificationManager;