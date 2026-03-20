import { registerUser } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
      <section class="container login-page">

        <div class="login-card">

          <div class="login-header">
            <h1 id="register-title">Daftar Akun</h1>
            <p>Buat akun baru untuk mulai berbagi cerita</p>
          </div>

          <form id="register-form" class="login-form" aria-labelledby="register-title">

            <div class="form-group">
              <label for="name">Nama</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Masukkan nama Anda"
                required
              >
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan email"
                required
              >
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Masukkan password"
                required
              >
            </div>

            <button type="submit" class="login-btn">
              Daftar
            </button>

          </form>

          <div id="message" class="login-message"></div>

          <p class="login-register">
            Sudah punya akun?
            <a href="#/login">Login di sini</a>
          </p>

        </div>

      </section>
    `;
  }

  async afterRender() {
    this._setupForm();
  }

  _setupForm() {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const result = await registerUser(data);

        if (!result.error) {
          document.getElementById('message').textContent =
            'Registrasi berhasil! Silakan login.';
          window.location.hash = '#/login';
        } else {
          document.getElementById('message').textContent =
            'Registrasi gagal. Silakan coba lagi.';
        }

      } catch (error) {
        document.getElementById('message').textContent =
          'Terjadi kesalahan. Silakan coba lagi.';
      }
    });
  }
}