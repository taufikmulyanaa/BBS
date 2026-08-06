# ASCII Wireframes — Bapak-Bapak Sepedahan (MVP Biaya Rendah)

**Cakupan:** Sesuai scope MVP di PRD (Fase 1–3): Fondasi & Rute, Open Ride, Forum Ringan — plus layar pendukung (Autentikasi, Profil). Fitur yang ditunda (Chapter, Marketplace, Cari Teman Gowes, Event, Challenge) belum diwireframe karena belum masuk MVP.

**Legenda notasi:**
- `[ Teks ]` = tombol solid/utama
- `( Teks )` = tombol sekunder/outline
- `[______]` = input field
- `<` di pojok kiri atas = tombol kembali
- `HR` / garis `+---+` = pemisah section
- Bottom nav `[Tab]` = tab yang sedang aktif

**Peta Navigasi (Information Architecture):**

```
Landing Page (Web)
   |
   +-- [Download App] --> Splash --> Login/Daftar
                                          |
                                          v
                              +----------------------+
                              |     Beranda (Home)     |
                              +----------------------+
                                          |
        +----------------+---------------+---------------+----------------+
        |                |               |                |                |
     [Rute]          [Open Ride]      [Forum]          [Profil]
        |                |               |                |
   Direktori Rute   Daftar Open Ride  Daftar Diskusi   Info Akun
        |                |               |                |
   Detail Rute    +-- Buat Ride    Detail Diskusi   > Rute Favorit
        |         |                +-- Buat Post     > Open Ride Saya
   - Unduh GPX  Detail Ride         (komentar)        > Post Saya
   - Simpan                                            > Pengaturan
   - Rute Favorit
     (tersimpan)
```

## Modul 0 -- Landing Page (Web)

### Landing Page (Web Statis)
```
+----------------------------------------------------------------+
| [Logo]  BAPAK-BAPAK SEPEDAHAN                                  |
|        Rute  Forum  OpenRide      [Masuk] [Daftar]             |
+----------------------------------------------------------------+
|                                                                |
|               KOMUNITAS SEPEDA UNTUK KITA SEMUA                |
|         Temukan rute, teman gowes, dan komunitas sehat         |
|                                                                |
|             [ Download App ]     [ Jelajahi Rute ]             |
|                                                                |
+----------------------------------------------------------------+
| Rute Populer                                        Lihat Semua|
| +------------+  +------------+  +------------+                 |
| | Monas Loop |  | Braga-Lbg  |  | Puncak Pass|                 |
| | EASY 15km  |  | MEDIUM 28km|  | HARD 72km  |                 |
| +------------+  +------------+  +------------+                 |
+----------------------------------------------------------------+
|          Tentang | Kontak | Instagram | Grup WhatsApp          |
+----------------------------------------------------------------+
```

## Modul 1 -- Autentikasi

### Login
```
+--------------------------------------+
| <  Masuk                             |
+--------------------------------------+
|                                      |
|               [ LOGO ]               |
|        BAPAK-BAPAK SEPEDAHAN         |
|     Gowes Bareng * Sehat Bahagia     |
|                                      |
|  Email                               |
|  [________________________________]  |
|  Kata Sandi                          |
|  [________________________________]  |
|                                      |
|  [              MASUK               ]|
|                                      |
|   ------------- atau -------------   |
|                                      |
|  (       Masuk dengan Google        )|
|                                      |
|       Belum punya akun? Daftar       |
|                                      |
+--------------------------------------+
```

### Daftar (Register)
```
+--------------------------------------+
| <  Buat Akun                         |
+--------------------------------------+
|                                      |
|  Nama Lengkap                        |
|  [________________________________]  |
|  Email                               |
|  [________________________________]  |
|  Kata Sandi                          |
|  [________________________________]  |
|                                      |
|  [ ] Saya setuju Syarat & Ketentuan  |
|                                      |
|  [              DAFTAR              ]|
|                                      |
|   ------------- atau -------------   |
|  (       Daftar dengan Google       )|
|                                      |
|   Cek email untuk verifikasi akun    |
+--------------------------------------+
```

## Modul 2 -- Beranda

### Beranda (Home)
```
+--------------------------------------+
| Halo, Ogie!                          |
| Selamat gowes hari ini.              |
+--------------------------------------+
| Rute Populer              Lihat>     |
| +-------------+  +-------------+     |
| | Monas Loop  |  | Braga-Lbg   |     |
| | EASY 15km   |  | MEDIUM 28km |     |
| +-------------+  +-------------+     |
+--------------------------------------+
| Open Ride Terdekat     Lihat>        |
| 10 Mei  Gowes Pagi BSD-Ciater        |
|        40km * Easy * 6/10 peserta    |
| 11 Mei  Sunrise Ride Sentul          |
|        60km * Medium * 4/15 peserta  |
|                                      |
|  [         + BUAT OPEN RIDE         ]|
+--------------------------------------+
|[Home]| Rute | Ride | Forum | Profil  |
+--------------------------------------+
```

## Modul 3 -- Rute

### Direktori Rute
```
+--------------------------------------+
| <  Rute                              |
+--------------------------------------+
| [ Cari rute...                    ]  |
| [Semua][Easy][Medium][Hard]  [Filter]|
+--------------------------------------+
| Monas Loop - Jakarta Pusat           |
| EASY * 15km * 20m elevasi * 4.8(120) |
+--------------------------------------+
| Braga - Lembang via Punclut          |
| MEDIUM * 28km * 850m elev * 4.9 (210)|
+--------------------------------------+
| Puncak Pass - Cianjur                |
| HARD * 72km * 1250m elevasi * 4.7(98)|
+--------------------------------------+
|          Muat lebih banyak           |
+--------------------------------------+
| Home |[Rute]| Ride | Forum | Profil  |
+--------------------------------------+
```

### Detail Rute
```
+--------------------------------------+
| <  Detail Rute                       |
+--------------------------------------+
| [     Peta / Preview Rute      ]     |
| [                              ]     |
| [                              ]     |
| Braga - Lembang via Punclut          |
| 28km * 850m elevasi * 4.9 (210)      |
| [Tanjakan][Pemandangan][Kopi]        |
+--------------------------------------+
| Rute favorit menuju Lembang dengan   |
| pemandangan indah & banyak pilihan   |
| kopi di sepanjang jalan.             |
+--------------------------------------+
| [Unduh GPX] [Simpan] [Bagikan]       |
+--------------------------------------+
| [Info Rute][Elevasi][Diskusi]        |
| 2 jam lalu - Asep                    |
| Kemarin lewat sini, jalannya bagus   |
| dan warung Punclut sudah buka.       |
+--------------------------------------+
| Home |[Rute]| Ride | Forum | Profil  |
+--------------------------------------+
```

### Rute Favorit (Tersimpan)
```
+--------------------------------------+
| <  Rute Tersimpan                    |
+--------------------------------------+
| Rute Tersimpan (3)                   |
+--------------------------------------+
| * Monas Loop - Jakarta Pusat         |
|  EASY * 15km                         |
+--------------------------------------+
| * Braga - Lembang via Punclut        |
|  MEDIUM * 28km                       |
+--------------------------------------+
| * Puncak Pass - Cianjur              |
|  HARD * 72km                         |
+--------------------------------------+
|         Jelajahi rute lain >         |
+--------------------------------------+
```

## Modul 4 -- Open Ride

### Daftar Open Ride
```
+--------------------------------------+
| <  Open Ride                         |
+--------------------------------------+
| [Semua][Minggu ini][Level]  [Filter] |
+--------------------------------------+
| 10 MEI  Gowes Pagi BSD - Ciater      |
|        Sab, 10 Mei * 05:30 * Easy    |
|        Titik kumpul: Teraskota BSD   |
|        6/10 peserta          [JOIN]  |
+--------------------------------------+
| 11 MEI  Sunrise Ride Sentul          |
|        Ming, 11 Mei * 05:45 * Medium |
|        Titik kumpul: AEON Sentul     |
|        4/15 peserta          [JOIN]  |
+--------------------------------------+
| 12 MEI  Long Ride Puncak 100K        |
|        Sen, 12 Mei * 05:15 * Hard    |
|        Titik kumpul: Rest Area Gadog |
|        3/20 peserta          [JOIN]  |
+--------------------------------------+
|  [         + BUAT OPEN RIDE         ]|
+--------------------------------------+
| Home | Rute |[Ride]| Forum | Profil  |
+--------------------------------------+
```

### Buat Open Ride
```
+--------------------------------------+
| <  Buat Open Ride                    |
+--------------------------------------+
|  Judul Ride (co: Gowes Pagi BSD)     |
|  [________________________________]  |
|  Tanggal & Waktu                     |
|  [________________________________]  |
|  Jarak (km)                          |
|  [________________________________]  |
|  Level                               |
|  [ Easy v ] [ Medium ] [ Hard ]      |
|  Titik Kumpul                        |
|  [________________________________]  |
|  Maks Peserta (co: 10)               |
|  [________________________________]  |
|  Catatan (opsional: No drop, dsb)    |
|  [________________________________]  |
|                                      |
|  [            BUAT RIDE             ]|
+--------------------------------------+
| Home | Rute |[Ride]| Forum | Profil  |
+--------------------------------------+
```

### Detail Open Ride
```
+--------------------------------------+
| <  Detail Ride                       |
+--------------------------------------+
| Gowes Pagi BSD - Ciater              |
| Sabtu, 10 Mei 2026 * 05:30           |
| Level: Easy * Jarak: 40km            |
| Titik kumpul: Teraskota BSD          |
| Catatan: No drop, jaga pace.         |
+--------------------------------------+
| Dibuat oleh: Ogie                    |
+--------------------------------------+
| Peserta (6/10)                       |
| [o][o][o][o][o][o] +join lainnya     |
+--------------------------------------+
|  [          JOIN RIDE INI           ]|
|        Batalkan keikutsertaan        |
+--------------------------------------+
| Home | Rute |[Ride]| Forum | Profil  |
+--------------------------------------+
```

## Modul 5 -- Forum Ringan

### Forum - Daftar Diskusi
```
+--------------------------------------+
| <  Forum                             |
+--------------------------------------+
| [Untuk Anda][Mengikuti][Terbaru]     |
+--------------------------------------+
| Dicky * 3 jam lalu                   |
| Tanjakan Cibodas via Cipanas         |
| Ada perbaikan jalan di KM 7-8.       |
| Hati-hati, masih berbatu.            |
| [gambar rute]                        |
| ^24  comment 6  save                 |
+--------------------------------------+
| Rudi * 5 jam lalu                    |
| Kopi enak di rute Puncak Pass?       |
| Rekomendasi kopi enak di sekitar     |
| Puncak Pass arah Cianjur dong?       |
| ^15  comment 12  save                |
+--------------------------------------+
|  [           + BUAT POST            ]|
+--------------------------------------+
| Home | Rute | Ride |[Forum]| Profil  |
+--------------------------------------+
```

### Detail Diskusi + Komentar
```
+--------------------------------------+
| <  Detail Post                       |
+--------------------------------------+
| Dicky Hendrawan * 3 jam lalu         |
| Rute: Braga - Lembang via Punclut    |
+--------------------------------------+
| Tanjakan Cibodas via Cipanas         |
| Ada perbaikan jalan di tanjakan KM   |
| 7-8. Hati-hati, masih berbatu.       |
| [     foto kondisi jalan       ]     |
+--------------------------------------+
| ^ Suka (24)   Komentar (6)   Simpan  |
+--------------------------------------+
| Asep * 2 jam lalu                    |
| Siap, makasih infonya bang!          |
+--------------------------------------+
| Rudi * 1 jam lalu                    |
| Kemarin masih ada alat berat di sana |
+--------------------------------------+
|  Tulis komentar...                   |
|  [________________________________]  |
+--------------------------------------+
| Home | Rute | Ride |[Forum]| Profil  |
+--------------------------------------+
```

### Buat Post / Laporan
```
+--------------------------------------+
| <  Buat Post                         |
+--------------------------------------+
|  Tipe Post                           |
|  [Diskusi] [Laporan Kondisi Jalan]   |
|  Judul                               |
|  [________________________________]  |
|  Isi                                 |
|  [                              ]    |
|  [                              ]    |
|  [                              ]    |
|  Tautkan ke Rute (opsional)          |
|  [ Pilih rute...            v ]      |
|  [+ Tambah Foto]  (maks 5, 5MB)      |
|                                      |
|  [             POSTING              ]|
+--------------------------------------+
| Home | Rute | Ride |[Forum]| Profil  |
+--------------------------------------+
```

## Modul 6 -- Profil

### Profil
```
+--------------------------------------+
| <  Profil                            |
+--------------------------------------+
|      [ foto profil ]                 |
|             Ogie Pratama             |
|        Anggota sejak Jan 2026        |
+--------------------------------------+
| 12   Rute Disimpan                   |
| 8    Open Ride Diikuti               |
| 15   Post Forum                      |
+--------------------------------------+
| > Rute Favorit Saya                  |
| > Open Ride Saya (dibuat & diikuti)  |
| > Post & Komentar Saya               |
+--------------------------------------+
| > Pengaturan Akun                    |
| > Bantuan                            |
| > Keluar                             |
+--------------------------------------+
| Home | Rute | Ride | Forum |[Profil] |
+--------------------------------------+
```

