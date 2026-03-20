import { registerSW } from 'virtual:pwa-register';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import PushNotificationManager from './utils/push-notification.js';

// Global push notification manager
window.pushManager = new PushNotificationManager();

// 1. Daftarkan Service Worker (Kriteria 3: PWA)
registerSW({ immediate: true });

document.addEventListener('DOMContentLoaded', async () => {
  // --- A. LOGIKA STATUS LOGIN (Untuk Kontrol Menu) ---
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Hapus class lama agar tidak bentrok saat logout/login ulang
  document.body.classList.remove('logged-in', 'logged-out');
  
  if (user) {
    document.body.classList.add('logged-in');
  } else {
    document.body.classList.add('logged-out');
  }

  // --- B. INISIALISASI PUSH NOTIFICATION (Kriteria 2) ---
  if ('serviceWorker' in navigator) {
    try {
      // Tunggu hingga Service Worker benar-benar aktif sebelum init push
      await navigator.serviceWorker.ready;
      await window.pushManager.init();
      console.log('Push Notification Manager Ready');
    } catch (err) {
      console.error('Push Notification Init Failed:', err);
    }
  }

  // --- C. PWA INSTALL PROMPT (Kriteria 3) ---
  let deferredPrompt;
  const installButton = document.createElement('button');
  installButton.textContent = 'Install App';
  installButton.id = 'install-app-btn'; // Tambahkan ID agar mudah diatur di CSS
  installButton.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #007bff;
    color: white; border: none; padding: 10px 20px; border-radius: 5px;
    cursor: pointer; display: none; z-index: 1000; font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(installButton);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
  });

  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      deferredPrompt = null;
      installButton.style.display = 'none';
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('App was installed successfully');
    installButton.style.display = 'none';
  });

  // --- D. INISIALISASI APLIKASI ---
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  // Render halaman pertama kali
  await app.renderPage();

  // Pantau perubahan URL hash
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    
    // Opsional: Tutup drawer otomatis setelah navigasi (jika di mobile)
    const drawer = document.querySelector('#navigation-drawer');
    if (drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
    }
  });
});