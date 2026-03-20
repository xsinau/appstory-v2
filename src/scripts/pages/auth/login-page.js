import { loginUser } from '../../data/api.js';

export default class LoginPage {
  async render() {
    return `
      <section class="container login-page">

        <div class="login-card">

          <div class="login-header">
            <h1 id="login-title">Login</h1>
            <p>Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form id="login-form" class="login-form" aria-labelledby="login-title">

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email"
                id="email"
                name="email"
                placeholder="Masukkan email"
                required
                aria-describedby="email-help"
              >
              <span id="email-help" class="sr-only">Masukkan alamat email Anda</span>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password"
                id="password"
                name="password"
                placeholder="Masukkan password"
                required
                aria-describedby="password-help"
              >
              <span id="password-help" class="sr-only">Masukkan kata sandi Anda</span>
            </div>

            <button type="submit" class="login-btn" aria-describedby="login-help">
              Login
            </button>

            <span id="login-help" class="sr-only">Masuk ke akun Anda</span>

          </form>

          <div id="message" class="login-message" role="status" aria-live="polite"></div>

          <p class="login-register">
            Belum punya akun? 
            <a href="#/register">Daftar di sini</a>
          </p>

        </div>

      </section>
    `;
  }

  async afterRender() {
    this._setupForm();
  }

  _setupForm() {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      try {
        const result = await loginUser(data);

        if (result.error === false) {
          localStorage.setItem('token', result.loginResult.token);
          localStorage.setItem('user', JSON.stringify(result.loginResult));

          document.getElementById('message').textContent = 'Login berhasil!';
          window.location.hash = '#/';
        } else {
          document.getElementById('message').textContent =
            'Login gagal. Periksa email dan password.';
        }

      } catch (error) {
        document.getElementById('message').textContent =
          'Terjadi kesalahan. Silakan coba lagi.';
      }
    });
  }
}