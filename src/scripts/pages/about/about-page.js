export default class AboutPage {
  async render() {
    return `
      <section class="about-page container">
        <header class="about-header">
          <h1>Tentang Platform Berbagi Cerita</h1>
          <p>
            Platform ini dirancang sebagai ruang digital untuk berbagi pengalaman 
            dan cerita dari berbagai tempat. Pengguna dapat mengunggah cerita 
            lengkap dengan foto serta titik lokasi sehingga cerita dapat 
            divisualisasikan secara geografis.
          </p>
        </header>

        <section class="about-features">
          <h2>Fitur Utama Aplikasi</h2>
          <ul>
            <li>Membuat dan mempublikasikan cerita lengkap dengan gambar.</li>
            <li>Menambahkan koordinat lokasi pada setiap cerita.</li>
            <li>Menampilkan kumpulan cerita pada peta interaktif.</li>
            <li>Sistem autentikasi untuk menjaga keamanan akun pengguna.</li>
            <li>Navigasi halaman yang halus menggunakan transisi modern.</li>
          </ul>
        </section>

        <section class="about-benefits">
          <h2>Manfaat Penggunaan</h2>
          <p>
            Dengan aplikasi ini, pengguna dapat mendokumentasikan perjalanan,
            pengalaman, maupun kejadian menarik di berbagai lokasi. Cerita yang
            dibagikan juga dapat membantu pengguna lain menemukan tempat atau
            pengalaman baru melalui peta yang tersedia.
          </p>
        </section>

        <section class="about-tech">
          <h2>Teknologi yang Digunakan</h2>
          <ul>
            <li>HTML, CSS, dan JavaScript sebagai dasar pengembangan web.</li>
            <li>Leaflet.js untuk menampilkan peta interaktif.</li>
            <li>RESTful API sebagai penghubung data antara aplikasi dan server.</li>
            <li>View Transitions API untuk pengalaman navigasi yang lebih halus.</li>
          </ul>
        </section>

        <footer class="about-footer">
          <p>
            Aplikasi ini dikembangkan sebagai proyek pembelajaran untuk
            mengeksplorasi pengembangan web modern dan integrasi peta digital.
          </p>
        </footer>
      </section>
    `;
  }

  async afterRender() {
    // fungsi ini dapat digunakan untuk menambahkan interaksi tambahan
    console.log("Halaman About berhasil dimuat.");
  }
}