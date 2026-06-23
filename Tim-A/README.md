# 🌟 GLOSIO - Platform Pembelajaran Bahasa Yunani

GLOSIO adalah sebuah platform untuk pembelajaran Bahasa Yunani interaktif. Aplikasi ini dirancang menggunakan arsitektur modern Next.js App Router dan diintegrasikan dengan Supabase sebagai sistem backend, autentikasi, serta database. Platform ini dilengkapi dengan fitur pelacakan kemajuan belajar (*gamification*), latihan adaptif, dan evaluasi berbasis AI.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Aplikasi GLOSIO dibangun menggunakan teknologi modern berkinerja tinggi berikut:

### **Frontend & Framework**
*   **Next.js 16.2.6 (App Router):** Menggunakan fitur Server Components untuk render cepat, optimalisasi SEO, serta routing dinamis berbasis file.
*   **React 19:** Memanfaatkan pembaruan performa terbaru dari React.
*   **TypeScript:** Memastikan tipe data yang aman (*type-safety*) dan meminimalkan kesalahan kode saat pengembangan.

### **Styling & UI Design**
*   **Tailwind CSS v4:** Digunakan untuk penataan gaya yang cepat, responsif, dan konsisten.
*   **shadcn/ui & Radix Primitives:** Komponen dasar UI (*accessible unstyled components*) yang disesuaikan untuk tampilan premium dengan standar aksesibilitas tinggi.
*   **Lucide React:** Pustaka ikon vektor yang konsisten dan modern.
*   **Mikro-animasi & Responsive Layout:** Tampilan antarmuka yang dinamis dengan transisi halus, dioptimalkan sepenuhnya untuk perangkat seluler, tablet, hingga desktop.

### **Backend, Database & Autentikasi**
*   **Supabase (PostgreSQL):** Database utama dengan kemampuan waktu nyata (*real-time*).
*   **Supabase Auth:** Autentikasi pengguna menggunakan email/password serta integrasi Google OAuth.
*   **Row Level Security (RLS):** Keamanan data tingkat baris PostgreSQL untuk memastikan pengguna hanya dapat mengakses data milik mereka sendiri.
*   **Supabase SSR:** Integrasi client-server Next.js yang aman untuk pengelolaan sesi pengguna.

### **Kecerdasan Buatan (AI)**
*   **Google Gemini API / Mock AI Scorer:** Evaluasi percakapan interaktif menggunakan AI untuk menganalisis respons pengguna (menggunakan Gemini-2.5-Flash) atau *fallback* menggunakan *mock scorer* untuk pengujian offline.

### **Pengujian & Kualitas Kode (Quality Assurance)**
*   **Vitest:** Kerangka kerja pengujian unit (*unit testing*) berkecepatan tinggi.
*   **Playwright:** Pengujian otomatis ujung-ke-ujung (*E2E smoke tests*) pada browser sungguhan.
*   **ESLint & TypeScript Compiler (tsc):** Menjaga kualitas dan standar penulisan kode.

---

## ✨ Fitur-Fitur Utama

GLOSIO menawarkan fitur pembelajaran lengkap yang menarik bagi pengguna baru:

1.  **Sistem Autentikasi yang Aman:**
    *   Registrasi dan Login menggunakan email & password.
    *   Dukungan Google Sign-In untuk login cepat.
    *   Rute dasbor terlindungi (*protected dashboard routes*) dengan pemeriksaan sesi aktif.

2.  **Dasbor Pembelajaran Interaktif & Gamifikasi:**
    *   **XP (Experience Points) & Streak Tracker:** Memotivasi pengguna untuk belajar setiap hari secara konsisten.
    *   **Profil & Statistik:** Grafik pencapaian serta ringkasan progres belajar murid.
    *   **Leaderboard (Papan Peringkat):** Kompetisi skor XP antar-pengguna secara real-time.

3.  **Jalur Pembelajaran Bergradasi (Lesson Path):**
    *   Materi terstruktur (mulai dari *Greek Basics 1*, *At The Café*, hingga *City Directions*).
    *   Pilihan mode belajar (*Difficulty Chooser*): Standard vs Accelerated Mode.

4.  **5 Mode Latihan Interaktif:**
    *   📚 **Vocabulary Practice:** Latihan kosakata Yunani pilihan ganda.
    *   🎧 **Listening Practice:** Latihan mendengarkan audio pengucapan kata Yunani dan mencocokkan artinya.
    *   🗣️ **Speaking Practice:** Latihan melafalkan kata Yunani secara langsung melalui mikrofon.
    *   ✍️ **Writing Practice:** Latihan menulis huruf dan kata Yunani. Dilengkapi **Virtual Greek Keyboard bawaan** agar pengguna tidak perlu memasang layout keyboard Yunani pada OS mereka.
    *   💬 **Conversation Practice:** Simulasi percakapan interaktif dengan pemandu AI. Pengguna dapat merespons lewat teks/suara dan mendapatkan skor evaluasi langsung berdasarkan kelayakan konteks dan tata bahasa.

---

## 📂 Struktur Direktori Project

Untuk memudahkan pemahaman alur kode bagi pembaca pertama kali, berikut adalah struktur folder utama dari GLOSIO:

```text
├── src/
│   ├── app/                      # Next.js App Router (Rute halaman & API)
│   │   ├── (auth)/               # Rute halaman login, register, dan reset sandi
│   │   ├── (dashboard)/          # Rute halaman utama setelah login (dashboard, learn, profile)
│   │   ├── api/                  # API Endpoint (evaluasi percakapan, TTS, dll)
│   │   └── layout.tsx            # Layout global aplikasi
│   │
│   ├── components/               # Komponen UI global (button, dialog, input, dll)
│   │
│   ├── features/                 # Modularisasi fitur utama aplikasi
│   │   ├── auth/                 # Form & logika autentikasi
│   │   ├── conversation/         # Logika chat, input audio, & keyboard virtual Yunani
│   │   ├── difficulty/           # Pemilih mode belajar & tingkat kesulitan
│   │   ├── gamification/         # Logika penghitungan streak, quest, & XP
│   │   ├── leaderboard/          # Komponen tabel peringkat
│   │   ├── lessons/              # Jalur pembelajaran & daftar modul
│   │   ├── practice/             # Rangka latihan dinamis & latihan kosakata
│   │   ├── speech/               # Fitur latihan berbicara & pengenalan suara
│   │   └── writing/              # Fitur latihan menulis
│   │
│   ├── lib/                      # Utilitas, helper, dan integrasi API (Supabase & AI)
│   ├── server/                   # Server Actions Next.js untuk query database langsung
│   └── types/                    # Definisi tipe TypeScript global
│
├── supabase/                     # Konfigurasi Supabase
│   ├── migrations/               # Berkas SQL migrasi schema database
│   └── seed.sql                  # Data awal (modul pembelajaran, kuis, badge)
│
├── tests/                        # Kumpulan pengujian aplikasi
│   ├── unit/                     # Unit testing (Vitest)
│   └── e2e/                      # End-to-End testing (Playwright)
│
└── package.json                  # Konfigurasi dependensi project
```

---

## 🚀 Panduan Instalasi & Menjalankan Project

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi GLOSIO di komputer lokal Anda:

### **1. Prasyarat**
Sebelum memulai, pastikan perangkat Anda telah terpasang:
*   [Node.js](https://nodejs.org/) versi 20 atau lebih baru.
*   [pnpm](https://pnpm.io/) sebagai package manager (`npm i -g pnpm`).
*   Akun dan project [Supabase](https://supabase.com/).

### **2. Kloning dan Instalasi Dependensi**
Masuk ke direktori project lalu pasang semua pustaka yang diperlukan:
```bash
pnpm install
```

### **3. Konfigurasi Environment Variables**
Salin berkas contoh environment:
```bash
cp .env.example .env.local
```

Buka `.env.local` dan isi nilainya sesuai dengan project Supabase & kunci API Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Konfigurasi Kecerdasan Buatan (AI)
AI_PROVIDER=mock                     # Gunakan 'mock' untuk lokal tanpa API, atau 'gemini' untuk integrasi AI asli
GEMINI_API_KEY=your-gemini-api-key   # Diperlukan jika AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash        # Model Gemini default

# URL Aplikasi
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **4. Migrasi & Seeding Database (Supabase)**
Anda perlu mempersiapkan skema database beserta data awal (lessons & badges).

**Opsi A: Menggunakan Supabase CLI (Direkomendasikan)**
Jika Anda menggunakan CLI lokal:
```bash
# Push skema database ke project Supabase
supabase db push

# Masukkan data pembelajaran dasar (seeding)
supabase db seed
```

**Opsi B: Manual via Supabase Dashboard**
Jika Anda tidak menggunakan CLI, Anda dapat menyalin dan menjalankan kode SQL langsung pada **SQL Editor** di dashboard Supabase Anda dengan urutan berikut:
1. Jalankan isi file `supabase/migrations/0001_initial_schema.sql` untuk membuat tabel.
2. Jalankan isi file `supabase/migrations/0002_security_performance_fixes.sql` untuk kebijakan keamanan & optimasi.
3. Jalankan isi file `supabase/seed.sql` untuk menambahkan modul pelajaran Yunani dasar.

### **5. Jalankan Server Development**
Setelah database dan env siap, jalankan aplikasi menggunakan perintah:
```bash
pnpm dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🧪 Menjalankan Pengujian (Testing)

Untuk memastikan aplikasi berjalan dengan baik dan tidak ada kode yang rusak, Anda dapat menjalankan perintah-perintah berikut:

*   **Pemeriksaan Tipe TypeScript:**
    ```bash
    pnpm typecheck
    ```
*   **Pemeriksaan Linting (Kerapian Kode):**
    ```bash
    pnpm lint
    ```
*   **Unit Testing (Vitest):**
    ```bash
    pnpm test
    ```
*   **End-to-End Testing (Playwright):**
    ```bash
    pnpm e2e
    ```
    *Catatan: Perintah `pnpm e2e` secara otomatis akan mem-build aplikasi dan menjalankan penjelajahan browser otomatis untuk menguji seluruh alur pendaftaran, masuk, hingga kuis.*

---

## 🔒 Kebijakan Keamanan & Database

*   Semua tabel publik dilengkapi dengan **Row Level Security (RLS)**.
*   Data modul pembelajaran (`lessons` & `lesson_items`) dapat dibaca oleh seluruh pengguna terdaftar (*authenticated*).
*   Data pribadi pengguna seperti profil, riwayat sesi belajar, perolehan XP, rekaman suara, serta lencana penghargaan hanya dapat dibaca dan dimodifikasi oleh pemilik data tersebut.
*   Leaderboard menggunakan PostgreSQL View yang terproteksi (`security_invoker`) untuk menjamin keamanan query peringkat pengguna secara global.
