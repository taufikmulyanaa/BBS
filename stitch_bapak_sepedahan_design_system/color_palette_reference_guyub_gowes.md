# Guyub Gowes — Color Palette Reference

## Brand Personality
**Premium, Maskulin, Modern, Komunitas Outdoor.**
Identitas visual yang kokoh dengan kontras tinggi, dioptimalkan untuk penggunaan mode gelap (Dark Mode) yang nyaman untuk dibaca saat gowes malam maupun siang hari.

---

## 1. Primary Colors (Golden Amber)
Warna utama yang digunakan untuk CTA, tombol primer, dan status aktif.

| Peran | Hex | Preview | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Primary** | `#EA9B28` | ![#EA9B28](https://via.placeholder.com/15/EA9B28?text=+) | CTA utama, Icon aktif, Brand identity |
| **Primary Hover** | `#D98A17` | ![#D98A17](https://via.placeholder.com/15/D98A17?text=+) | State hover pada tombol primer |
| **Primary Light** | `#F7C56A` | ![#F7C56A](https://via.placeholder.com/15/F7C56A?text=+) | Badge, highlight, aksen halus |

### Primary Scale
- `100`: `#FDECC9`
- `200`: `#F9D891`
- `300`: `#F7C56A`
- `400`: `#F1B348`
- `500`: `#EA9B28` (Base)
- `600`: `#D98A17`
- `700`: `#C97710`
- `800`: `#A86407`
- `900`: `#8B5200`

---

## 2. Neutral & Surface Colors
Fondasi struktural untuk latar belakang, kartu, dan pembatas.

| Peran | Hex | Preview | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Background** | `#141415` | ![#141415](https://via.placeholder.com/15/141415?text=+) | Latar belakang halaman utama |
| **Surface** | `#232322` | ![#232322](https://via.placeholder.com/15/232322?text=+) | Background Card, Navbar, Bottom Nav |
| **Surface Alt** | `#464338` | ![#464338](https://via.placeholder.com/15/464338?text=+) | Card sekunder, input field |
| **Border** | `#68645D` | ![#68645D](https://via.placeholder.com/15/68645D?text=+) | Divider, border komponen, outline |

### Neutral Scale
- `100`: `#F5F5F5` (Text Primary)
- `300`: `#B9BEC3` (Text Secondary)
- `400`: `#8E8B87` (Text Muted)
- `500`: `#68645D` (Border)
- `700`: `#353534` (Surface Dark)
- `800`: `#232322` (Surface)
- `900`: `#141415` (Background)

---

## 3. Typography
Hierarki teks untuk keterbacaan optimal di layar gelap.

| Peran | Hex | Preview | Keterangan |
| :--- | :--- | :--- | :--- |
| **Text Primary** | `#F5F5F5` | ![#F5F5F5](https://via.placeholder.com/15/F5F5F5?text=+) | Judul (Headings), teks utama |
| **Text Secondary** | `#B9BEC3` | ![#B9BEC3](https://via.placeholder.com/15/B9BEC3?text=+) | Deskripsi, body copy |
| **Text Muted** | `#8E8B87` | ![#8E8B87](https://via.placeholder.com/15/8E8B87?text=+) | Placeholder, teks bantuan, caption |

---

## 4. Semantic Colors
Warna fungsional untuk status dan informasi.

- **Success:** `#5DBB63` (Konfirmasi, Selesai)
- **Warning:** `#EA9B28` (Peringatan, Perhatian)
- **Danger:** `#D9534F` (Error, Hapus, Berhenti)
- **Info:** `#4A90E2` (Informasi tambahan)

---

## CSS Variables Quick-Reference
```css
:root {
  --primary: #EA9B28;
  --bg: #141415;
  --surface: #232322;
  --text-primary: #F5F5F5;
  --text-secondary: #B9BEC3;
  --border: #68645D;
}
```