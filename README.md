# ⚡ LARIAN AMAL MERDEKA // 31.08
### *Retro-Futurist Glitch Art Charity Marathon Terminal*

[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20Enterprise-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🛰️ Gambaran Keseluruhan (Overview)

**Larian Amal Merdeka** adalah aplikasi pendaftaran acara larian amal sempena sambutan Hari Kebangsaan 31 Ogos. Direka khas dengan identiti visual **Retro-Futurist 'Glitch Art'**, aplikasi ini menggabungkan kontras warna tajam (Cyan vs. Magenta), tipografi pixel (`Silkscreen`, `VT323`, `Share Tech Mono`), animasi screen tearing, dan terminal telemetri mesin.

Aplikasi ini dihubungkan secara langsung dengan **Google Cloud Firestore** dan **Firebase Authentication** untuk penyimpanan pendaftaran masa nyata dan pengesahan pengguna.

---

## ⚡ Ciri-Ciri Utama (Core Features)

1. **Pendaftaran Peserta Langsung (Biometric Registration Terminal)**:
   * Borang pendaftaran dengan validasi ketat (Nama Penuh, E-mel, Kategori, Saiz Jersi, Nombor Kecemasan).
   * Penjanaan automatik kod bib unik (`LAM-101`, `LAM-102`, dll.).
   * Penjanaan **Digital Glitch Runner Bib Card** dengan kod bar simulator & fungsi cetak (`window.print`).

2. **Pangkalan Data Cloud Firestore Masa Nyata (`onSnapshot`)**:
   * Penyelarasan langsung tanpa perlu muat semula halaman.
   * Telemetri peserta berdaftar dan dana terkumpul (RM 50 x peserta) dikira secara automatik.
   * Paparan status sambungan Firestore di bar navigasi atas (`FIRESTORE UPLINK: ONLINE`).

3. **Sistem Pengesahan Fleksibel (Firebase Authentication)**:
   * **Direct Email & Password**: Log masuk atau daftar akaun baharu terus dengan e-mel dan kata laluan.
   * **Google Cloud OAuth**: Log masuk pantas 1-klik melalui Google Sign-In popup.

4. **Konsol Operator / Pengurusan Admin (`SYS_OP`)**:
   * Akses pentadbir untuk pemantauan data pendaftaran.
   * Carian peserta berasaskan Nama, Kod Bib, atau E-mel.
   * Penapis mengikut kategori larian (10KM Veteran, 10KM Open, 5KM Fun Run) dan status.
   * Fungsi kemas kini status peserta (`confirmed` / `cancelled`) dan pemadaman rekod.
   * Muat turun laporan lengkap dalam format **CSV**.
   * Butang **Seed Sample Telemetry** untuk memasukkan contoh peserta ujian terus ke Firestore.

5. **Kategori Larian**:
   * `10KM VETERAN RUN` (06:30 AM) – RM 50.00
   * `10KM OPEN CHALLENGE` (06:45 AM) – RM 50.00
   * `5KM NEON FUN RUN` (07:15 AM) – RM 50.00

---

## 🛠️ Struktur Pangkalan Data Firestore

Pangkalan data dikonfigurasikan mengikut spesifikasi `firebase-blueprint.json`:

```
/databases/{database}/documents
  ├── /registrations/{registrationId}   --> Rekod pendaftaran peserta
  │     ├── fullName: string (2-100 aksara)
  │     ├── email: string (3-120 aksara)
  │     ├── category: '10km_veteran' | '10km_open' | '5km_fun'
  │     ├── tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL'
  │     ├── bibNumber: string (pattern: ^LAM-[0-9]{3,6}$)
  │     ├── feePaid: 50 (tetap)
  │     ├── emergencyContact: string (maks 60 aksara)
  │     ├── status: 'confirmed' | 'cancelled'
  │     ├── userId: string
  │     └── createdAt: timestamp
  └── /test/connection                 --> Probe pengesahan sambungan
```

---

## 🔒 Keselamatan Firestore (Security Rules)

Peraturan keselamatan `firestore.rules` mematuhi prinsip **Zero-Trust Attribute-Based Access Control (ABAC)**:
* **Anti-Update-Gap Validation**: Memastikan semua input data mematuhi had panjang dan format sebelum dibenarkan ditulis.
* **Immortality Protection**: Medan seperti `createdAt`, `bibNumber`, dan `feePaid` tidak boleh diubah suai selepas penciptaan.
* **ID Poisoning Guard**: Menyekat sebarang suntikan aksara luar biasa ke dalam path dokumen.
* **Admin Privilege Control**: Tindakan penghapusan dan pengubahan status disekat kepada pentadbir sah sahaja.

---

## 🚀 Panduan Menjalankan Aplikasi (Local Development)

### 1. Prasyarat
* [Node.js](https://nodejs.org/) (versi 18 ke atas)
* npm atau bun

### 2. Pemasangan Ketergantungan
```bash
npm install
```

### 3. Konfigurasi Firebase
Pastikan fail `firebase-applet-config.json` mengandungi tetapan projek anda:
```json
{
  "projectId": "gen-lang-client-0883279539",
  "appId": "1:1081189322670:web:0d2f2a888d773b2f98c23f",
  "apiKey": "...",
  "authDomain": "gen-lang-client-0883279539.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-larianamalmerdek-bdab4c2a-c88a-4c8a-85b9-01a15bc999a3"
}
```

### 4. Menjalankan Server Pembangunan
```bash
npm run dev
```
Aplikasi boleh diakses melalui pelayar di `http://localhost:3000`.

### 5. Membina untuk Pengeluaran (Build)
```bash
npm run build
```

---

## 🔑 Mengaktifkan Email/Password di Firebase Console

Jika anda ingin menggunakan log masuk Email/Password dan menerima ralat `auth/operation-not-allowed`:
1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih projek anda &#10142; **Build** &#10142; **Authentication**.
3. Pergi ke tab **Sign-in method**.
4. Klik **Email/Password** &#10142; hidupkan pilihan **Enable** &#10142; klik **Save**.

---

## 🎨 Identiti Rekaan (Visual Style)

* **Font Utama**: `'Silkscreen'` (tajuk/pixel), `'VT323'` (nombor/angka besar), `'Share Tech Mono'` (teks badan).
* **Palet Warna**:
  * Cyan Neon: `#00FFFF`
  * Magenta Glitch: `#FF007F`
  * Cyber Amber: `#FFE600`
  * Void Black: `#06060C`
* **Kesan Khas**: CRT scanline overlay, chromatic aberration glitch text, screen-tear keyframes, pixel corner badges.

---

&copy; 2026 LARIAN AMAL MERDEKA. SEMUA HAK CIPTA TERPELIHARA.
