import { getStories } from '../../data/api.js';
import CONFIG from '../../config.js';
import IndexedDBManager from '../../utils/indexed-db.js';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Beranda</h1>

        <div class="map-container">
          <h2>Peta Lokasi Cerita</h2>
          <div id="map" style="height:500px; width:100%;" role="img" aria-label="Peta lokasi cerita"></div>
        </div>

        <div class="filter-container">
          <h2>Filter Lokasi</h2>
          <div class="search-box">
            <label for="location-filter">Cari lokasi:</label>
            <input type="text" id="location-filter" placeholder="Cari lokasi..." aria-describedby="filter-help">
            <span id="filter-help" class="sr-only">
              Masukkan nama lokasi atau deskripsi untuk memfilter cerita
            </span>
          </div>

          <div class="notification-controls" style="margin-top: 1rem;">
            <button id="notification-toggle" class="btn-notification" aria-label="Toggle push notifications">
              🔔 Loading...
            </button>
          </div>
        </div>

        <div class="content-wrapper">
          <h2>Daftar Cerita</h2>
          <div class="story-list" id="story-list" role="list" aria-label="Daftar cerita"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('HomePage afterRender called');
    this.dbManager = new IndexedDBManager();
    await this.dbManager.init();

    const token = localStorage.getItem('token');

    if (!token) {
      document.getElementById("story-list").innerHTML = `
        <p style="color:red;">Silakan login terlebih dahulu untuk melihat cerita 📌</p>
      `;
      return;
    }

    try {
      this.stories = await getStories(token);
      await this.dbManager.saveStoriesToCache(this.stories);
    } catch (error) {
      console.error("❌ Error mengambil data stories:", error);
      this.stories = await this.dbManager.getAllStories();

      if (!this.stories.length) {
        document.getElementById("story-list").innerHTML = `
          <p style="color:red;">Gagal memuat data stories dan tidak ada cache tersedia ❗</p>
        `;
        return;
      }
    }

    this.favorites = await this.dbManager.getFavorites() || [];

    this._renderStories();
    this._initializeMap();
    this._setupFilter();
    this._setupFavorites();
    
    // Inisialisasi Fitur Notifikasi
    await this._setupNotificationToggle();
  }

  _renderStories() {
    const storyList = document.getElementById('story-list');
    if (!storyList) return;

    storyList.innerHTML = this.stories.map(story => `
      <div class="story-item" data-id="${story.id}" role="listitem" tabindex="0" aria-label="Cerita: ${story.name}">
        <img src="${story.photoUrl}" alt="${story.name}" loading="lazy">
        <div class="story-item__content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <small>${new Date(story.createdAt).toLocaleDateString()}</small>
          <div class="story-item__actions">
            <button class="favorite-btn" data-id="${story.id}" aria-label="Toggle favorite">
              ${this.favorites.includes(story.id) ? '❤️' : '🤍'}
            </button>
            <button class="delete-btn" data-id="${story.id}" aria-label="Delete story">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  _initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || !window.L) return;

    try {
      this.map = L.map('map').setView([-2.5489, 118.0149], 5); // Default view Indonesia

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      this.markers = {};
      this.stories.forEach(story => {
        if (story.lat && story.lon) {
          const marker = L.marker([story.lat, story.lon]).addTo(this.map);
          marker.bindPopup(`
            <b>${story.name}</b><br>
            <img src="${story.photoUrl}" alt="${story.name}" style="width: 100px; margin-top:5px;"><br>
            <small>${story.description.substring(0, 50)}...</small>
          `);
          this.markers[story.id] = marker;
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  _setupFilter() {
    const filterInput = document.getElementById('location-filter');
    if (!filterInput) return;

    filterInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filteredStories = this.stories.filter(story =>
        story.name.toLowerCase().includes(query) ||
        story.description.toLowerCase().includes(query)
      );

      // Re-render list sederhana tanpa merusak state map
      const storyList = document.getElementById('story-list');
      storyList.innerHTML = filteredStories.map(story => `
        <div class="story-item" data-id="${story.id}">
           <h3>${story.name}</h3>
        </div>
      `).join('');
    });
  }

  _setupFavorites() {
    const storyList = document.getElementById('story-list');
    if (!storyList) return;

    storyList.addEventListener('click', async (e) => {
      const storyId = e.target.dataset.id;
      if (e.target.classList.contains('favorite-btn')) {
        const isFavorite = await this.dbManager.toggleFavorite(storyId);
        e.target.textContent = isFavorite ? '❤️' : '🤍';
      }
    });
  }

  /**
   * PERBAIKAN KRITIS: Penanganan Push Notification
   * Memastikan window.pushManager sudah terinisialisasi dan status sinkron.
   */
  async _setupNotificationToggle() {
    const toggleButton = document.getElementById('notification-toggle');
    if (!toggleButton || !window.pushManager) return;

    // 1. Inisialisasi manager (menunggu Service Worker ready)
    await window.pushManager.init();

    // 2. Update teks tombol berdasarkan status langganan saat ini
    const updateButtonUI = () => {
      const isSubscribed = window.pushManager.getSubscriptionStatus();
      toggleButton.textContent = isSubscribed ? '🔕 Disable Notifications' : '🔔 Enable Notifications';
      toggleButton.classList.toggle('subscribed', isSubscribed);
    };

    updateButtonUI();

    // 3. Event Listener dengan alur asinkronus yang benar
    toggleButton.addEventListener('click', async () => {
      toggleButton.disabled = true; // Cegah double click saat proses
      toggleButton.textContent = '⌛ Processing...';

      try {
        if (window.pushManager.getSubscriptionStatus()) {
          const success = await window.pushManager.unsubscribe();
          if (!success) alert('Gagal mematikan notifikasi');
        } else {
          const success = await window.pushManager.subscribe();
          if (!success) alert('Gagal mengaktifkan notifikasi. Pastikan izin diberikan.');
        }
      } catch (err) {
        console.error('Notification Toggle Error:', err);
      } finally {
        updateButtonUI();
        toggleButton.disabled = false;
      }
    });
  }
}