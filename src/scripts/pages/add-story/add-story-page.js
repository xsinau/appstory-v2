import { addStory } from '../../data/api.js';
import CONFIG from '../../config.js';
import IndexedDBManager from '../../utils/indexed-db.js';

export default class AddStoryPage {

  async render() {
    return `
      <section class="container add-story-page">
        <h1>Tambah Cerita Baru</h1>

        <form id="add-story-form" class="story-form">

          <div class="form-group">
            <label for="description">Deskripsi Cerita</label>
            <textarea id="description" name="description" required placeholder="Tuliskan cerita Anda..."></textarea>
          </div>

          <div class="form-group">
            <label for="photo">Upload Foto</label>
            <input type="file" id="photo" name="photo" accept="image/*">

            <div class="camera-buttons">
              <button type="button" id="start-camera">Start Kamera</button>
              <button type="button" id="capture-photo">Capture</button>
              <button type="button" id="stop-camera">Stop Kamera</button>
            </div>

            <video id="camera-preview" autoplay playsinline width="320"></video>
            <canvas id="camera-canvas" style="display:none;"></canvas>
          </div>

          <div class="form-group">
            <label>Pilih Lokasi Cerita</label>
            <div id="map" style="height:300px;"></div>
          </div>

          <button type="submit" class="submit-btn">Add Story</button>

        </form>

        <div id="message"></div>
      </section>
    `;
  }

  async afterRender() {
    this.dbManager = new IndexedDBManager();
    await this.dbManager.init();

    this._initializeMap();
    this._setupCamera();
    this._setupForm();
  }

  // =========================
  // MAP
  // =========================

  _initializeMap() {

    this.map = L.map('map').setView([-6.2, 106.816666], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.marker = null;

    this.map.on('click', (e) => {

      if (this.marker) {
        this.map.removeLayer(this.marker);
      }

      this.marker = L.marker(e.latlng).addTo(this.map);

      this.lat = e.latlng.lat;
      this.lon = e.latlng.lng;

    });
  }


  // =========================
  // CAMERA
  // =========================

  _setupCamera() {

    const startBtn = document.getElementById('start-camera');
    const captureBtn = document.getElementById('capture-photo');
    const stopBtn = document.getElementById('stop-camera');

    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('camera-canvas');
    const photoInput = document.getElementById('photo');

    let stream = null;

    startBtn.addEventListener('click', async () => {

      try {

        stream = await navigator.mediaDevices.getUserMedia({ video: true });

        video.srcObject = stream;

      } catch (error) {

        console.error('Kamera tidak bisa diakses:', error);

      }

    });


    captureBtn.addEventListener('click', () => {

      if (!stream) return;

      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {

        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        photoInput.files = dataTransfer.files;

      });

    });


    stopBtn.addEventListener('click', () => {

      if (stream) {

        stream.getTracks().forEach(track => track.stop());

        video.srcObject = null;

        stream = null;

      }

    });

  }


  // =========================
  // FORM SUBMIT
  // =========================

  _setupForm() {

    const form = document.getElementById('add-story-form');

    form.addEventListener('submit', async (e) => {

      e.preventDefault();

      const formData = new FormData(form);

      formData.append('lat', this.lat);
      formData.append('lon', this.lon);

      const storyData = {
        description: formData.get('description'),
        photo: formData.get('photo'),
        lat: this.lat,
        lon: this.lon,
        token: localStorage.getItem('token'),
        createdAt: new Date().toISOString()
      };

      try {

        const result = await addStory(formData);

        document.getElementById('message').textContent =
          'Cerita berhasil ditambahkan!';

        form.reset();

        if (this.marker) {
          this.map.removeLayer(this.marker);
        }

      } catch (error) {

        await this.dbManager.saveStory(storyData);

        document.getElementById('message').textContent =
          'Cerita disimpan offline dan akan disinkronkan saat online.';

      }

    });

  }

}