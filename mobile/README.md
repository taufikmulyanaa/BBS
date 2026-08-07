# Guyub Gowes — Mobile (Flutter)

Aplikasi mobile untuk komunitas "Bapak-Bapak Sepedahan", terhubung ke **Supabase project yang sama** dengan web app (`src/lib/supabase.ts`). Package name: `bapak_bapak_sepedahan` (nama yang sudah dipakai di `pubspec.yaml` sebelumnya, tidak diganti).

## Status: MVP inti — sudah diverifikasi build

Sudah dibangun: **Auth** (email/password + tombol Google), **Beranda**, **Rute** (list, detail, rating/ulasan, simpan rute), **Open Ride** (list, detail, join/leave, buat/edit/hapus), **Profil** minimal (avatar, nama, sign out).

Belum dibangun (menyusul di iterasi berikutnya): Forum lengkap (sekarang cuma placeholder tab), Chapter, Event Sepeda, Create Route (upload GPX/cover — butuh storage bucket baru), edit profil lengkap.

`flutter analyze` bersih (0 error/warning, 1 info deprecation non-blocking) dan `flutter build web --release` berhasil compile penuh. Folder platform (`android/`, `ios/`, `web/`) sudah di-generate dan ikut di-commit — tinggal `pub get` lalu jalankan.

## Cara menjalankan

```bash
cd mobile
flutter pub get
flutter run                # pilih device Android/iOS yang terhubung, atau:
flutter run -d chrome      # preview cepat di browser tanpa emulator
```

Belum sempat dites di device/emulator fisik atau `flutter build apk` (Android SDK tidak tersedia di lingkungan tempat ini ditulis) — kalau nemu error runtime yang tidak ketangkap `flutter analyze`, tempel pesannya di sesi berikutnya biar diperbaiki.

## Konfigurasi lanjutan (opsional)

- **Google Sign-In**: tombolnya sudah ada di layar Auth, tapi belum akan berfungsi sampai kamu:
  1. Bikin OAuth client di Google Cloud Console (package name `com.guyubgowes.bapak_bapak_sepedahan` + SHA-1 certificate untuk Android, bundle id untuk iOS).
  2. Set provider Google + Redirect URL (`io.supabase.guyubgowes://login-callback`, lihat `lib/data/repositories/auth_repository.dart`) di dashboard Supabase Auth project ini.
  3. Daftarkan deep link scheme `io.supabase.guyubgowes` di `android/app/src/main/AndroidManifest.xml` (intent-filter) dan `ios/Runner/Info.plist` (`CFBundleURLTypes`).
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
