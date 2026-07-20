# Hadirin Front

Frontend admin panel untuk aplikasi presensi **Hadirin**. Dipakai oleh admin/HR
untuk memantau kehadiran karyawan, merekap presensi bulanan, dan mengelola
pengajuan ijin/cuti.

Dibangun dengan:

| Kebutuhan        | Teknologi                                  |
|------------------|---------------------------------------------|
| Framework        | Vue 3 (Composition API, `<script setup>`)   |
| Build tool       | Vite                                        |
| Routing          | Vue Router 4                                |
| State management | Pinia                                       |
| HTTP client      | Axios                                       |
| Styling          | Tailwind CSS 4                              |
| Backend          | REST API terpisah (Go), autentikasi JWT     |

Backend **tidak** ada di repo ini (proyek terpisah). Dokumentasi kontrak
API-nya ada di `hadirin-backend.md` — baca file itu kalau butuh detail
endpoint, format request/response, atau batasan yang belum didukung backend.
Semua modul di proyek ini sudah tersambung ke data nyata (bukan dummy lagi).

---

## 1. Instalasi & Menjalankan

```bash
npm install
cp .env.example .env   # lalu sesuaikan VITE_API_BASE_URL
npm run dev             # development, default http://localhost:5173
npm run build            # build produksi ke folder dist/
npm run preview          # preview hasil build
```

`.env` **tidak** ikut ke git (lihat `.gitignore`). Kalau butuh menambah
environment variable baru, tambahkan juga contohnya di `.env.example`.

---

## 2. Cara Kerja Aplikasi (Gambaran Besar)

1. **`index.html`** memuat font Inter & Material Symbols, lalu mem-boot
   **`src/main.js`**.
2. **`src/main.js`** membuat instance Vue, memasang Pinia dan Router, lalu
   mount ke `#app`.
3. **`src/router/index.js`** menentukan halaman apa yang tampil di URL apa.
   Ada 2 "layout" pembungkus:
   - `BlankLayout` — halaman tanpa sidebar (dipakai Login).
   - `DashboardLayout` — halaman dengan sidebar + header (semua halaman admin).
4. Sebelum pindah halaman, **route guard** (`router.beforeEach` di
   `router/index.js`) mengecek status login lewat Pinia store
   `useAuthStore` (`src/modules/login/login.store.js`). Kalau halaman butuh
   login (`meta.requiresAuth`) tapi belum ada token → dilempar ke `/login`.
5. Setiap request ke backend **wajib** lewat **`src/shared/services/api.js`**
   (instance Axios). File ini otomatis menempelkan header
   `Authorization: Bearer <token>` ke setiap request, otomatis logout +
   redirect ke `/login` kalau backend membalas `401`, dan **meng-unwrap
   envelope response backend** (`{ success, code, message, data }`) sehingga
   `await api.get(...)` langsung mengembalikan isi envelope itu — ambil
   datanya dengan `const { data } = await someService.list()`. Kalau request
   gagal, `catch (err)` menerima envelope error tersebut; tampilkan
   `err.message` ke user (sudah dalam Bahasa Indonesia dari backend).
6. Tampilan dibangun dari komponen dasar (`src/shared/components/Base*.vue`)
   yang sudah mengikuti design system di `template/reliable_flow_desktop/DESIGN.md`
   dan token warna di `src/assets/main.css`. **Jangan menulis warna/ukuran
   baru sembarangan** — pakai token yang sudah ada atau tambahkan token baru
   di `main.css` kalau memang perlu.

---

## 3. Struktur Folder

Proyek ini pakai **arsitektur modular berbasis fitur**: semua file yang
berkaitan dengan satu fitur (halaman, route, store, dll) dikumpulkan dalam
satu folder di `src/modules/`, bukan dipisah berdasarkan tipe file.

```
src/
├── assets/
│   └── main.css              # import Tailwind + design token (warna, font, radius)
├── router/
│   └── index.js              # menggabungkan route dari semua modul + route guard
├── shared/                    # dipakai lintas modul, BUKAN milik satu fitur
│   ├── components/            # BaseButton, BaseCard, BaseBadge, BaseTable, BaseModal, AppSidebar, AppHeader
│   ├── layouts/                # BlankLayout, DashboardLayout
│   └── services/
│       └── api.js             # instance Axios + interceptor JWT + unwrap envelope
├── modules/
│   ├── login/
│   │   ├── LoginPage.vue
│   │   ├── login.store.js     # Pinia store: token, user, login(), logout(), fetchUser()
│   │   ├── login.service.js   # panggilan /auth/*
│   │   └── login.routes.js
│   ├── dashboard/              # kartu statistik, tren mingguan, aktivitas terbaru (dihitung dari data presensi/ijin)
│   ├── data-presensi/          # CRUD presensi harian
│   ├── rekap-presensi/         # rekap bulanan per karyawan (dihitung di frontend, backend tidak punya endpoint rekap)
│   ├── manajemen-ijin/         # pengajuan + setuju/tolak ijin
│   ├── karyawan/                # CRUD data karyawan
│   ├── divisi/                  # CRUD divisi + sub-fitur jadwal kerja 7 hari
│   ├── hari-libur/               # CRUD hari libur (nasional atau khusus satu divisi)
│   ├── pengguna/                 # daftar akun login (GET/DELETE) + daftarkan akun baru (lewat /auth/register)
│   ├── role/                     # CRUD role + assign/revoke ke user
│   └── menu-manager/             # CRUD menu sidebar (data) + permission per role
│       # setiap folder modul di atas berisi *Page.vue, *.routes.js, *.service.js
├── App.vue
└── main.js
```

**Aturan penting:**

- Kalau sebuah komponen/store/util **hanya** dipakai oleh satu modul → taruh
  di dalam folder modul itu.
- Kalau dipakai oleh **dua modul atau lebih** → pindahkan ke `src/shared/`.
- Jangan `import` langsung dari folder modul lain kecuali memang untuk
  data yang sifatnya lintas-modul (contoh: `AppSidebar.vue` di `shared/`
  boleh import `useAuthStore` dari `modules/login/login.store.js` karena
  status login memang dipakai di seluruh aplikasi).

---

## 4. Cara Membuat Modul Baru

Contoh di bawah pakai nama modul fiktif **`cabang`** (belum ada endpoint-nya
di backend, murni ilustrasi struktur). Untuk pola CRUD lengkap yang sungguhan
jalan melawan backend nyata, **lihat langsung kode di `src/modules/divisi/`**
(paling representatif — ada CRUD + sub-fitur modal jadwal) atau
`src/modules/karyawan/` — tinggal tiru pola yang sama.

### Langkah 1 — Buat folder modul

```
src/modules/cabang/
├── CabangPage.vue
├── cabang.routes.js
└── cabang.service.js
```

### Langkah 2 — Tulis service (`cabang.service.js`)

Satu objek berisi satu fungsi per endpoint. **Jangan** panggil `api`/`axios`
langsung dari komponen — selalu lewat file service ini.

```js
import api from '../../shared/services/api'

export const cabangService = {
  list: () => api.get('/cabang'),
  get: (id) => api.get(`/cabang/${id}`),
  create: (payload) => api.post('/cabang', payload),
  update: (id, payload) => api.put(`/cabang/${id}`, payload),
  remove: (id) => api.delete(`/cabang/${id}`),
}
```

### Langkah 3 — Tulis halaman (`CabangPage.vue`)

Pakai komponen dasar dari `shared/components/` (`BaseTable`, `BaseBadge`,
`BaseButton`, `BaseModal`) supaya konsisten dengan halaman lain. Path relatif
dari `src/modules/cabang/` ke shared adalah `../../shared/...`. Ambil data
lewat `onMounted` + service, bukan array statis:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import BaseTable from '../../shared/components/BaseTable.vue'
import BaseBadge from '../../shared/components/BaseBadge.vue'
import { cabangService } from './cabang.service'

const rows = ref([])
const loading = ref(false)
const error = ref('')

async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await cabangService.list()
    rows.value = data
  } catch (err) {
    error.value = err.message ?? 'Gagal memuat data cabang.'
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<template>
  <p v-if="error" class="text-sm text-error">{{ error }}</p>
  <p v-else-if="loading" class="text-sm text-outline">Memuat...</p>
  <BaseTable v-else>
    <template #head>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Nama</th>
      <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-outline">Status</th>
    </template>
    <tr v-for="row in rows" :key="row.id" class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-4 text-sm font-semibold text-on-surface">{{ row.nama }}</td>
      <td class="px-6 py-4"><BaseBadge tone="success">{{ row.status }}</BaseBadge></td>
    </tr>
  </BaseTable>
</template>
```

Untuk form tambah/edit, bungkus dengan `BaseModal` (lihat pola lengkapnya di
`DivisiPage.vue` atau `KaryawanPage.vue`: state `showFormModal`, `form`,
`editingId`, fungsi `openCreateForm`/`openEditForm`/`submitForm`).

### Langkah 4 — Definisikan route (`cabang.routes.js`)

`path` di sini adalah path **relatif** (child dari `DashboardLayout`, yang
sudah mount di `/`). `meta.title` dipakai `AppHeader` untuk judul halaman.

```js
import CabangPage from './CabangPage.vue'

export const cabangRoute = {
  path: 'cabang',
  name: 'cabang',
  component: CabangPage,
  meta: { title: 'Cabang' },
}
```

### Langkah 5 — Daftarkan ke router utama

Buka `src/router/index.js`, import route-nya, lalu masukkan ke array
`children` milik `DashboardLayout`:

```js
import { cabangRoute } from '../modules/cabang/cabang.routes'
// ...
children: [dashboardRoute, /* ...rute lain... */, cabangRoute],
```

### Langkah 6 — Tambahkan menu di sidebar

Buka `src/shared/components/AppSidebar.vue`, tambahkan entri baru di array
`menu` (`name` harus sama persis dengan `name` di route):

```js
{ name: 'cabang', label: 'Cabang', icon: 'store' },
```

### Langkah 7 — Cek hasilnya

```bash
npm run dev
```

Buka `/cabang` di browser (setelah login) — halaman baru harus muncul,
menu sidebar "Cabang" ter-highlight aktif, dan judul header berubah jadi
"Cabang".

> Kalau modulnya butuh state sendiri yang dipakai lintas komponen (misalnya
> filter yang harus diingat), buat `cabang.store.js` di folder modul yang
> sama memakai Pinia, ikuti pola di `login.store.js`.

---

## 5. Konvensi Penamaan & Kode

- **Nama file halaman**: `PascalCase` + akhiran `Page.vue` (`KaryawanPage.vue`).
- **Nama file route modul**: `kebab-case.routes.js`, isi export bernama
  `camelCaseRoute` (`karyawanRoute`).
- **Nama file store modul**: `kebab-case.store.js`, export bernama
  `useXxxStore` (mengikuti konvensi Pinia, contoh `useAuthStore`).
- **Nama file service modul**: `kebab-case.service.js`, export objek bernama
  `xxxService` berisi satu fungsi per endpoint (`list`, `get`, `create`,
  `update`, `remove`, dst). Komponen halaman **tidak pernah** memanggil
  `api`/`axios` langsung — selalu lewat objek service ini.
- **Komponen dasar (`Base*.vue`)**: hanya untuk elemen UI generik yang tidak
  tahu apa-apa soal data bisnis (tombol, card, badge, tabel, modal). Jangan
  taruh logic spesifik satu modul di dalamnya.
- **Warna & spacing**: selalu pakai class Tailwind yang merujuk ke token di
  `src/assets/main.css` (`bg-primary`, `text-outline`, `border-outline-variant`,
  dll), bukan hex code langsung, supaya tampilan tetap konsisten dengan
  `template/reliable_flow_desktop/DESIGN.md`.
- **Pola halaman CRUD**: `ref` untuk `rows`/`loading`/`error`, muat data di
  `onMounted`, tampilkan `err.message` (dari envelope error backend) saat
  gagal — jangan bikin pesan error sendiri kalau backend sudah mengirimnya.
- **Semua request HTTP** lewat `src/shared/services/api.js` (via
  `*.service.js` masing-masing modul). Jangan pernah
  `import axios from 'axios'` langsung di komponen/store lain.

---

## 6. Checklist Sebelum Commit / Pull Request

- [ ] `npm run build` sukses tanpa error.
- [ ] Tidak ada `console.log` yang tertinggal.
- [ ] File baru sudah masuk folder modul yang benar (`modules/<nama-modul>/`),
      bukan menumpuk semua di satu folder `pages/`.
- [ ] Komponen yang dipakai >1 modul sudah dipindah ke `shared/`, bukan
      di-copy-paste ke tiap modul.
- [ ] Warna/style baru memakai token yang sudah ada, atau kalau butuh token
      baru, tambahkan di `src/assets/main.css` (bukan hardcode hex di file
      komponen).
- [ ] Halaman baru sudah dites manual di browser (jalankan `npm run dev`,
      backend hidup), bukan cuma dicek lolos build.
- [ ] Setiap modul CRUD punya `*.service.js` sendiri; tidak ada komponen yang
      mengimpor `api`/`axios` langsung.

---

## 7. Referensi Desain & Backend

- Folder `template/` berisi acuan desain (mockup HTML statis + `DESIGN.md`)
  dan **bukan** bagian dari aplikasi yang di-build — folder ini di-ignore git
  (`template/*` di `.gitignore`) dan hanya dipakai sebagai referensi visual
  saat membangun halaman baru. Baca `template/reliable_flow_desktop/DESIGN.md`
  sebelum menambah komponen visual baru.
- File **`hadirin-backend.md`** berisi dokumentasi lengkap semua endpoint API
  (request/response, field wajib, validasi, hal yang belum didukung backend).
  **Baca file ini dulu** sebelum menambah pemanggilan API baru — jangan
  menebak bentuk request/response.

## 8. Hal-Hal yang Perlu Diingat Soal Backend Nyata

- Login pakai **`username`**, bukan email.
- Semua `id` adalah **UUID string**, bukan angka.
- Tidak ada pagination — endpoint list mengembalikan semua data sekaligus;
  filter/pencarian dilakukan di frontend (lihat pola di `DataPresensiPage.vue`).
- Backend **belum** punya endpoint rekap/laporan, approval ijin, atau
  check-in GPS. Modul `rekap-presensi` menghitung semuanya sendiri dari data
  mentah `/presensi` + `/ijin`; modul `manajemen-ijin` "Setuju/Tolak" memakai
  `PUT /ijin/:id` biasa (ada komentar `TODO` di kode untuk diganti kalau
  backend sudah punya endpoint approval khusus).
- `GET /roles/:id/users` **tidak ada** — modal "Anggota" di modul `role`
  karena itu tidak bisa menampilkan status assignment saat ini, hanya
  tombol Assign/Revoke independen. Lihat komentar di `RolePage.vue`.
- Kolom "Alpa" di rekap presensi sengaja ditampilkan `0` — menghitungnya
  butuh gabungan jadwal kerja divisi (`/divisions/:id/schedules`) dan hari
  libur (`/harilibur`), belum diimplementasikan (lihat komentar `TODO` di
  `RekapPresensiPage.vue`).

## 9. Troubleshooting Umum

| Gejala | Kemungkinan Penyebab |
|---|---|
| Halaman baru muncul blank / 404 | Route belum didaftarkan di `src/router/index.js`, atau `path`/`name` di `*.routes.js` typo. |
| Menu sidebar tidak ter-highlight | `name` di `AppSidebar.vue` tidak sama persis dengan `name` di file `*.routes.js`. |
| Halaman admin selalu lempar ke `/login` padahal sudah "login" | Token belum tersimpan di `localStorage` (cek key `token`), atau backend membalas selain 2xx sehingga interceptor di `api.js` menghapus token. |
| Style baru tidak muncul | Pastikan class Tailwind valid (cek typo) dan bukan class dinamis yang di-generate dari string (Tailwind v4 hanya mendeteksi class yang tertulis literal di kode). |
| `npm run dev` error module not found setelah pindah file | Path import relatif (`../../shared/...`) perlu disesuaikan ulang sesuai lokasi file yang baru. |
| Request gagal dengan CORS error di console browser | Origin frontend (`http://localhost:5173` atau port lain) belum masuk `CORS_ORIGINS` di `.env` **backend** — bukan bug di frontend, minta ditambahkan di sana. |
| Response terlihat aneh / `data` selalu `undefined` | Ingat `api.js` sudah meng-unwrap envelope — `await api.get(...)` mengembalikan `{ success, code, message, data }` langsung, jadi ambil dengan `const { data } = await xxxService.list()`, bukan `res.data.data`. |
| Backend membalas 400 saat create/update | Baca `err.message` — biasanya field wajib kosong, ID relasi (`division_id`/`karyawan_id`/dst) tidak ditemukan, atau kode/unique field-nya sudah dipakai. |
