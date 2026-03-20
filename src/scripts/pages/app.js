import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import PushNotificationManager from '../utils/push-notification.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._initApp(); // Gabungkan inisialisasi awal
  }

  async _initApp() {
    this.#setupDrawer();
    
    // Inisialisasi Push Notification Manager secara global
    // Ini krusial agar HomePage bisa memanggil window.pushManager.init()
    if (!window.pushManager) {
      window.pushManager = new PushNotificationManager();
    }
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }
    });

    // Menutup drawer saat link diklik
    this.#navigationDrawer.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        this.#navigationDrawer.classList.remove('open');
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. Logika Proteksi Route
    const protectedRoutes = ['/add-story', '/favorites', '/saved-stories'];
    if (protectedRoutes.includes(url) && !token) {
      window.location.hash = '#/login';
      return;
    }

    // 2. Sinkronisasi UI Navigasi (Login/Logout)
    this._updateNavigation(user);

    // 3. Render Halaman
    const page = routes[url] || routes['/']; // Fallback ke home jika route tidak ada

    // Logika Render dengan/tanpa View Transition
    const updateDOM = async () => {
      this.#content.innerHTML = await page.render();
      if (page.afterRender) {
        await page.afterRender();
      }
    };

    if (!document.startViewTransition) {
      await updateDOM();
      return;
    }

    document.startViewTransition(async () => {
      await updateDOM();
    });
  }

  _updateNavigation(user) {
    const navList = document.getElementById('nav-list');
    const existingLogout = document.getElementById('logout-item');

    if (user) {
      document.body.classList.add('logged-in');
      document.body.classList.remove('logged-out');

      if (!existingLogout) {
        const logoutLi = document.createElement('li');
        logoutLi.id = 'logout-item';
        logoutLi.innerHTML = `<a href="#" id="logout-link">Logout (${user.name})</a>`;
        navList.appendChild(logoutLi);

        logoutLi.querySelector('#logout-link').addEventListener('click', (e) => {
          e.preventDefault();
          this._handleLogout();
        });
      }
    } else {
      document.body.classList.add('logged-out');
      document.body.classList.remove('logged-in');
      if (existingLogout) existingLogout.remove();
    }
  }

  _handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Opsional: Unsubscribe push notification saat logout agar lebih bersih
    if (window.pushManager && window.pushManager.getSubscriptionStatus()) {
       window.pushManager.unsubscribe();
    }

    window.location.hash = '#/login';
  }
}

export default App;