import { precacheAndRoute } from 'workbox-precaching';

// Wajib untuk Vite PWA agar file masuk cache (Kriteria 3)
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', (event) => {
  let data;
  
  // Kriteria 2: Penanganan Push Notification dengan Try-Catch
  try {
    // Mencoba membaca sebagai JSON
    data = event.data ? event.data.json() : { title: 'AppStory', body: 'Pesan baru!' };
  } catch (e) {
    // Fallback jika data adalah string biasa (Menghindari Unexpected Token T)
    data = { 
      title: 'AppStory', 
      body: event.data ? event.data.text() : 'Pesan baru!' 
    };
  }

  const options = {
    body: data.body || data.options?.body || 'Cek cerita terbaru sekarang.',
    icon: '/appstory-v2/favicon.png',
    badge: '/appstory-v2/favicon.png',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AppStory', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/appstory-v2/')
  );
});