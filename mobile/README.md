# Guyub Gowes — Mobile (Flutter)

Aplikasi mobile untuk komunitas "Bapak-Bapak Sepedahan", terhubung ke **Supabase project yang sama** dengan web app (`src/lib/supabase.ts`). Package name: `bapak_bapak_sepedahan` (nama yang sudah dipakai di `pubspec.yaml` sebelumnya, tidak diganti).

## Status: MVP inti — sudah diverifikasi build

Sudah dibangun: **Auth** (email/password + tombol Google), **Beranda**, **Rute** (list, detail, rating/ulasan, simpan rute), **Open Ride** (list, detail, join/leave, buat/edit/hapus), **Profil** minimal (avatar, nama, sign out).

Belum dibangun (menyusul di iterasi berikutnya): Forum lengkap (sekarang cuma placeholder tab), Chapter, Event Sepeda, Create/Edit Route di mobile (masih lewat web app — `CreateRouteModal`/`EditRouteModal` di `src/components/`), edit profil lengkap.

`flutter analyze` bersih (0 error/warning, 1 info deprecation non-blocking) dan `flutter build web --release` berhasil compile penuh. Folder platform (`android/`, `ios/`, `web/`) sudah di-generate dan ikut di-commit — tinggal `pub get` lalu jalankan.

## Cara menjalankan

```bash
cd mobile
flutter pub get
flutter run                # pilih device Android/iOS yang terhubung, atau:
flutter run -d chrome      # preview cepat di browser tanpa emulator
```

Sudah dites `flutter run` & `flutter build apk` ke device Android fisik — berhasil.

**Windows only — kalau Gradle gagal dengan `Unable to establish loopback connection` / `Invalid argument: connect`:** ini bug AF_UNIX socket JDK yang muncul kalau `%TEMP%`/`%TMP%` mengarah ke folder yang difilter software tertentu (AV/OneDrive dkk) — biasanya `C:\Users\<user>\AppData\Local\Temp`. Bukan soal versi JDK atau kode project. Pakai `run-android.ps1` di folder ini (mengarahkan `TEMP`/`TMP` ke `.tools/gradletemp` lokal sebelum manggil `flutter`) alih-alih `flutter run` langsung:

```powershell
./run-android.ps1                # sama seperti flutter run
./run-android.ps1 build apk       # atau subcommand flutter lain
```

## Konfigurasi lanjutan (opsional)

- **Google Sign-In**: tombolnya sudah ada di layar Auth, dan `android/app/src/main/AndroidManifest.xml` sudah didaftarkan intent-filter buat nangkep deep link `io.supabase.guyubgowes://login-callback`. Yang masih perlu kamu lakukan sendiri (butuh akses dashboard yang saya nggak punya):
  1. Tambahkan `io.supabase.guyubgowes://login-callback` ke **Redirect URLs** di Supabase Dashboard → Authentication → URL Configuration (sejajar dengan `http://localhost:3000/**` yang sudah ada buat web).
  2. Bikin OAuth client Android di Google Cloud Console: package name `com.guyubgowes.bapak_bapak_sepedahan` + SHA-1 certificate dari keystore debug/release kamu (`cd android && ./gradlew signingReport` buat lihat SHA-1 debug).
  3. Untuk iOS: daftarkan URL scheme `io.supabase.guyubgowes` di `ios/Runner/Info.plist` (`CFBundleURLTypes`) — belum ada dari sekarang, karena environment ini nggak bisa build/verifikasi iOS.
  4. **Penting**: `flutter run -d chrome`/`-d edge` (mode web) TIDAK akan pakai deep link ini — itu jalan lewat redirect browser biasa (makanya kalau login lewat web-mode Flutter, larinya ke redirect URL web `localhost:3000`, bukan ke aplikasi). Deep link `io.supabase.guyubgowes://` cuma berlaku waktu jalan sebagai APK/app asli di Android/iOS.
- **Migration `08_add_route_reviews.sql`** perlu dijalankan di Supabase SQL editor (independen dari Flutter) — tabel `route_reviews` dipakai fitur rating/ulasan rute.
- `anonKey` di `lib/core/supabase_config.dart` sudah deprecated di `supabase_flutter` versi ini (info-level, bukan error) demi `publishableKey` — sengaja belum diganti karena butuh key baru dari dashboard Supabase yang beda format, dan web app juga masih pakai key lama ini.

## Struktur

```
lib/
  main.dart              # init Supabase + locale 'id_ID' + runApp
  app.dart                # MaterialApp.router
  core/
    supabase_config.dart  # URL + anon key (sama seperti web)
    theme/app_theme.dart   # palet warna & ThemeData (sudah ada sebelumnya, di-extend)
    router/app_router.dart # go_router: redirect ke /auth kalau belum login, StatefulShellRoute utk bottom nav
    widgets/               # main_shell.dart (bottom nav), state_views.dart (loading/error/empty/level badge)
  data/
    models/                 # Profile, AppRoute, RouteReview, OpenRide, RideParticipant, ForumPostPreview
    repositories/            # 1 repo per domain, bungkus query supabase_flutter
  providers/                 # Riverpod (hand-written, tanpa codegen/build_runner)
  features/
    auth/ home/ routes/ open_rides/ profile/ forum/   # 1 folder per fitur, presentation/ berisi screen
```

Kenapa tanpa `riverpod_generator`/`freezed`/`go_router_builder`: providernya tetap simpel tanpa perlu `dart run build_runner build`. Semua provider & model ditulis manual.

Cuma `android/`, `ios/`, `web/` yang di-generate (bukan `linux/`/`macos/`/`windows/`) karena scope-nya aplikasi mobile.
