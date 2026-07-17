# Hadirin Front

Frontend admin panel aplikasi presensi "Hadirin", dibangun dengan Vue 3 + Vite,
Pinia untuk state management, dan Tailwind CSS untuk styling. Terhubung ke
backend Go lewat REST API dengan autentikasi JWT.

## Instalasi

```bash
npm install
```

Salin `.env.example` menjadi `.env` dan sesuaikan URL backend:

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Menjalankan

```bash
npm run dev       # mode development
npm run build      # build produksi
npm run preview    # preview hasil build
```

## Struktur

- `src/layouts/` — `BlankLayout.vue` (tanpa sidebar, dipakai halaman login) dan `DashboardLayout.vue` (dengan sidebar admin).
- `src/pages/` — halaman: Login, Dashboard, Data Presensi, Rekap Presensi, Manajemen Ijin.
- `src/stores/auth.js` — state autentikasi (Pinia), menyimpan JWT di `localStorage`.
- `src/services/api.js` — instance axios dengan interceptor JWT; semua pemanggilan API wajib lewat file ini.
- `src/router/index.js` — routing + route guard berbasis status login.
- `template/` — acuan desain (mockup HTML statis + `DESIGN.md`), bukan bagian dari aplikasi yang di-build.

## Catatan

Data pada halaman Dashboard, Data Presensi, Rekap Presensi, dan Manajemen Ijin
masih berupa data dummy. Integrasi ke endpoint backend Go sebenarnya menyusul
setelah kontrak API-nya tersedia.
