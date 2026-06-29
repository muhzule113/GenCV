# GenCV Design System — "Drafting Table"

Setiap komponen adalah **kotak** dengan outline yang jelas. Tidak ada rounded corners, tidak ada gradient, tidak ada shadow dekoratif. Seperti gambar teknis di atas meja gambar: presisi, bersih, dan fungsional.

---

## Prinsip Inti

1. **Kotak dengan Garis Tegas** — `border-radius: 0` di semua elemen. Outline `1px solid` selalu terlihat.
2. **Monokrom + Satu Aksen** — Palet hitam-putih-abu dengan satu warna aksen (`clip: #1B6B8F`).
3. **Grid Kertas Milimeter** — Background `.bg-grid` 32px memberi kesan kertas teknis.
4. **Tipografi Fungsional** — `Space Grotesk` untuk heading (display), `Inter` untuk body, `JetBrains Mono` untuk label teknis.
5. **Tanpa Dekorasi** — Tidak ada rounded, shadow, gradient. Hanya border, spacing, dan tipografi.

---

## Palet Warna

| Token     | Hex       | Peran                                |
|-----------|-----------|--------------------------------------|
| `ink`     | `#1A1A1A` | Teks utama, border aktif, fill tombol primer |
| `paper`   | `#FAFAFA` | Background halaman                   |
| `sheet`   | `#F3F0EB` | Background sekunder (warm gray)      |
| `surface` | `#FFFFFF` | Kartu, modal, sidebar               |
| `border`  | `#E6E6E6` | Border default                       |
| `rule`    | `#D6D2CC` | Garis pembatas section               |
| `clip`    | `#1B6B8F` | Warna aksen (link, label teknis)     |
| `muted`   | `#888888` | Teks sekunder, placeholder           |
| `success` | `#16A34A` | Status berhasil                      |
| `danger`  | `#DC2626` | Error, hapus                         |
| `warning` | `#D97706` | Peringatan                           |

---

## Tipografi

| Token        | Size | Weight | Font           | Penggunaan           |
|--------------|------|--------|----------------|----------------------|
| `display-xl` | 56px | 600    | Space Grotesk  | Hero heading         |
| `display`    | 40px | 600    | Space Grotesk  | Section heading      |
| `h1`         | 32px | 600    | Space Grotesk  | Page title           |
| `h2`         | 22px | 600    | Space Grotesk  | Card title besar     |
| `h3`         | 17px | 500    | Space Grotesk  | Card title, modal    |
| `body`       | 15px | 400    | Inter          | Paragraf             |
| `sm`         | 13px | 400    | Inter          | Label, meta          |
| `xs`         | 11px | 400    | Inter          | Caption, timestamp   |
| `mono`       | 11px | 400    | JetBrains Mono | Label teknis, kode   |

**Aturan:**
- Heading selalu `font-display` (Space Grotesk)
- Label teknis/section tag: `font-mono text-[11px] tracking-widest text-clip uppercase`
- Tidak ada italic kecuali di konten CV/surat

---

## Spacing & Layout

| Token            | Nilai   | Penggunaan                  |
|------------------|---------|-----------------------------|
| `container-page` | 1120px  | Max-width konten utama      |
| `px-5`           | 20px    | Padding horizontal kontainer|
| Grid gap         | 24px    | `gap-6` antar kartu         |
| Section padding  | 96px    | `py-24` antar section       |
| Card padding     | 32px    | `p-8` di kartu fitur        |
| Compact padding  | 16-20px | `p-4`/`p-5` kartu kecil     |

---

## Komponen

### Button

Selalu kotak. Tidak ada `border-radius`.

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  ██ PRIMER ████████  │     │  ░░ OUTLINE ░░░░░░  │     │     GHOST           │
│  bg-ink text-paper   │     │  border-ink bg-none  │     │  bg-none border-0   │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

| Variant   | Class        | Visual                              |
|-----------|-------------|--------------------------------------|
| `primary` | `.btn`       | `bg-ink text-paper`, hover `bg-ink/90` |
| `outline` | `.btn-outline` | `border border-ink bg-transparent`, hover fill |
| `ghost`   | `.btn-ghost` | Tanpa border, hover `bg-ink/5`       |
| `danger`  | —           | `bg-danger text-white`               |

**Size:** `sm` (px-3 py-1.5), `md` (px-5 py-2.5), `lg` (px-7 py-3)

---

### Input / Field

Kotak dengan border tipis. Focus menghitamkan border.

```
┌──────────────────────────────────────┐
│ Label                                │
├──────────────────────────────────────┤
│ Placeholder text...                  │
│ border-border → focus: border-ink    │
└──────────────────────────────────────┘
```

| State    | Border         | Keterangan           |
|----------|----------------|----------------------|
| Default  | `border-border` | #E6E6E6             |
| Focus    | `border-ink`   | Garis hitam tegas    |
| Error    | `border-danger`| Merah                |

---

### Card

Kotak putih dengan outline. Hover menghitamkan border.

```
┌──────────────────────────────────────┐
│                                      │
│  Konten kartu                        │
│  bg-surface border-border            │
│  hover: border-ink                   │
│                                      │
└──────────────────────────────────────┘
```

Class: `.card` = `bg-surface border border-border`
Hover aktif (DocumentCard): `hover:border-ink`
Kartu fitur (landing): `bg-paper border border-ink p-8`

---

### Modal

Kotak tanpa rounded. Border hitam tipis.

```
┌──────────────────────────────────────────┐
│ Title                              [✕]   │
├──────────────────────────────────────────┤
│                                          │
│  Konten                                  │
│                                          │
├──────────────────────────────────────────┤
│                          [Batal] [Simpan]│
└──────────────────────────────────────────┘
```

- Background: `bg-surface border border-border`
- Header/footer dipisah `border-b`/`border-t border-border`
- Overlay: `bg-black/40`

---

### Sidebar

Kotak vertikal. Item aktif: fill hitam.

```
┌──────────────┐
│ ▪ Dashboard  │  ← bg-ink text-paper (aktif)
│   CV Saya    │  ← text-muted hover:bg-ink/5
│   Surat      │
│              │
│──────────────│  ← border-t
│   Keluar     │  ← hover:text-danger
└──────────────┘
```

- Container: `bg-surface border-r border-border`
- Item aktif: `bg-ink text-paper` (kotak penuh, tanpa rounded)
- Item hover: `hover:bg-ink/5`

---

### Navbar

Garis bawah sebagai pembatas. Minimalis.

```
┌──────────────────────────────────────────────────────┐
│ GenCV            Fitur  Cara Kerja      [Masuk] [CTA]│
└──────────────────────────────────────────────────────┘
  border-b border-rule
```

- Sticky top, `bg-surface`
- Logo: `font-display font-bold tracking-display`

---

### Toast

Kotak notifikasi. Muncul sementara.

```
┌──────────────────────────────────────┐
│ ✓  Pesan sukses                  [✕] │
│ border-border bg-surface             │
└──────────────────────────────────────┘
```

---

### Tag / Badge

Kotak kecil tanpa rounded untuk label.

```
┌────────┐  ┌────────┐
│ React  │  │ Node.js│   ← bg-ink/10 text-ink
└────────┘  └────────┘
```

- Pill: `px-3 py-1 bg-ink/10 text-ink text-sm`
- Type badge: `px-2 py-0.5 text-xs border border-border text-muted`

---

### Stepper

Langkah-langkah dalam kotak. Step aktif: fill hitam.

```
┌──────────┐──────┌──────────┐──────┌──────────┐
│ [1] Data │──────│ [2] Skill│──────│ [3] Done │
│ bg-ink   │      │ bg-border│      │ bg-border│
└──────────┘      └──────────┘      └──────────┘
```

- Step aktif: `bg-ink text-white`
- Step selesai: icon check, `text-success`
- Connector: garis `h-0.5 bg-border` (selesai: `bg-ink`)

---

### EmptyState

Teks terpusat dengan CTA.

```
         [icon]
     Belum ada CV

  Buat CV pertama Anda
  dengan mudah dan cepat.

    ┌──────────────┐
    │  Buat CV     │
    └──────────────┘
```

---

### Divider

Garis horizontal dengan ornamen diamond.

```
────────────────── ◆ ──────────────────
     bg-rule (#D6D2CC), diamond clip
```

Class: `.section-divider` — garis `bg-rule` dengan `::after` diamond `◆` warna `clip`.

---

## Pola Visual

### Background Grid (Drafting Table)

```css
.bg-grid {
  background-image:
    linear-gradient(to right, #EBE8E3 1px, transparent 1px),
    linear-gradient(to bottom, #EBE8E3 1px, transparent 1px);
  background-size: 32px 32px;
}
```

Digunakan di halaman landing sebagai "kertas milimeter".

### Section Pattern

```
┌─ SECTION ──────────────────────────────────────────┐
│                                                     │
│  [LABEL MONO]  ← font-mono text-clip uppercase      │
│  Heading Display  ← font-display text-display        │
│  Deskripsi singkat  ← text-sm text-muted             │
│                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │ Card 1  │  │ Card 2  │  │ Card 3  │             │
│  └─────────┘  └─────────┘  └─────────┘             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Section bergantian: `bg-paper` ↔ `bg-surface border-y border-rule`
- Padding section: `py-24`

### Hover & State

| State      | Efek                                    |
|------------|----------------------------------------|
| Hover link | `text-muted → text-ink`                |
| Hover card | `border-border → border-ink`           |
| Hover btn  | `bg-ink → bg-ink/90` atau fill terbalik|
| Focus      | `ring-2 ring-ink/30` atau `border-ink`  |
| Disabled   | `opacity-40 cursor-not-allowed`        |
| Active nav | `bg-ink text-paper` (kotak solid)      |

---

## Animasi & Transisi

Prinsip: **cepat, muncul tegas, hilang langsung** — seperti meletakkan kertas di meja, bukan menjatuhkannya. Tidak ada bounce, spring, atau efek elastis.

### Teknik Utama: Sharp Cut-in + Border Draw

Semua popup/alert/modal menggunakan dua animasi yang berjalan bersamaan:

1. **Sharp Cut-in** — Elemen muncul dari `scaleY(0)` → `scaleY(1)` dari atas ke bawah, seperti kertas yang diletakkan tegas di meja. Cepat (150ms), tanpa bounce.
2. **Border Draw** — Border hitam (`border-ink`) digambar mengelilingi elemen menggunakan `clip-path: inset()`. Seperti penggaris menarik garis di sekeliling kotak. Sedikit lebih lambat (200ms) untuk memberi kesan presisi.

### Durasi

| Kategori       | Durasi | Easing         | Penggunaan                    |
|----------------|--------|----------------|-------------------------------|
| Micro          | 100ms  | `ease-out`     | Hover warna, border change    |
| Cut-in (enter) | 150ms  | `ease-out`     | Modal, toast, dropdown masuk  |
| Cut-out (exit) | 100ms  | `ease-in`      | Modal, toast keluar           |
| Border draw    | 200ms  | `ease-out`     | Border mengelilingi elemen    |
| Overlay        | 200ms  | `ease-out`     | Backdrop modal fade in        |

**Aturan:** Enter selalu lebih lambat dari exit. Border draw selalu mulai bersamaan atau 50ms setelah cut-in.

### Keyframes

```css
/* Sharp Cut-in: elemen muncul dari atas (scaleY) */
@keyframes cutIn {
  from { opacity: 0; transform: scaleY(0); transform-origin: top; }
  to   { opacity: 1; transform: scaleY(1); transform-origin: top; }
}
@keyframes cutOut {
  from { opacity: 1; transform: scaleY(1); transform-origin: top; }
  to   { opacity: 0; transform: scaleY(0); transform-origin: top; }
}

/* Border Draw: border digambar mengelilingi elemen via clip-path */
@keyframes borderDraw {
  0%   { clip-path: inset(0 100% 100% 0); }
  40%  { clip-path: inset(0 0 100% 0); }
  70%  { clip-path: inset(0 0 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}

/* Overlay */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### Tailwind Animation Tokens

```js
// tailwind.config.js → theme.extend.animation
animation: {
  'cut-in':      'cutIn 150ms ease-out forwards',
  'cut-out':     'cutOut 100ms ease-in forwards',
  'border-draw': 'borderDraw 200ms ease-out forwards',
  'overlay-in':  'overlayFadeIn 200ms ease-out forwards',
  'toast-in':    'toastCutIn 150ms ease-out forwards, borderDraw 200ms ease-out 50ms forwards',
}
```

### Per Komponen

**Modal**
```
Enter: overlay fade (200ms) + panel scaleY 0→1 (150ms) + border draw (200ms)
Exit:  overlay fade out (150ms) + panel scaleY 1→0 (100ms)
```
- Overlay: `animate-overlay-in`
- Panel: `animate-cut-in`
- Border: elemen `<div>` absolute dengan `border-ink` + `animate-border-draw`

**Toast**
```
Enter: scaleY 0→1 (150ms) + border draw (200ms, delay 50ms)
Exit:  fade out via unmount
```
- Container: `animate-toast-in`
- Border: elemen `<div>` absolute dengan `border-ink` + `animate-border-draw`

**Dropdown Menu**
```
Enter: scaleY 0→1 dari atas (150ms) + border draw (200ms)
Exit:  fade out (100ms)
```

**Sidebar (mobile slide)**
```
Enter: slide dari kiri (200ms ease-out)
Exit:  slide ke kiri (150ms ease-in)
```
```css
@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
@keyframes slideOutLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}
```

### Cara Menambahkan Border Draw ke Komponen

Tambahkan elemen overlay `<div>` di dalam komponen:
```jsx
<div className="relative ..."> {/* container utama */}
  <div className="absolute inset-0 border border-ink pointer-events-none animate-border-draw" />
  {/* konten */}
</div>
```

### Transisi Inline (Tailwind)

Untuk perubahan state sederhana (hover, focus), cukup class Tailwind:

| Elemen         | Class                            |
|----------------|----------------------------------|
| Warna teks     | `transition-colors duration-150` |
| Border + warna | `transition-all duration-150`    |
| Background     | `transition-colors duration-150` |

### Yang TIDAK Boleh

| Dilarang                      | Alasan                                  |
|-------------------------------|-----------------------------------------|
| `bounce`, `spring`, `elastic` | Bukan karakter drafting table           |
| Durasi > 300ms                | Terasa lambat, menghambat interaksi     |
| Animasi dekoratif (parallax)  | Menambah noise visual                   |
| `transform: rotate` pada UI  | Kotak tidak berputar di meja gambar     |
| Animasi saat scroll           | Konten langsung terlihat, tidak perlu reveal |
| `scale()` uniform             | Gunakan `scaleY()` — cut-in, bukan zoom |
---

## Yang TIDAK Boleh Dilakukan

| Dilarang                | Alasan                              |
|-------------------------|-------------------------------------|
| `rounded-*`             | Merusak estetika kotak/drafting     |
| `shadow-*` dekoratif    | Hanya `.cv-page` boleh shadow       |
| Gradient di UI          | Hanya boleh di template CV (modern) |
| Warna di luar palet     | Konsistensi token                   |
| Icon fill/solid         | Semua icon: stroke-only, 24x24      |
| Rounded pada tombol     | Tombol = kotak tegas                |
| Animasi berlebihan      | Lihat section Animasi & Transisi    |

---

## Checklist Komponen Baru

Sebelum membuat komponen baru, pastikan:

- [ ] Border `1px solid` terlihat jelas
- [ ] Tidak ada `border-radius`
- [ ] Menggunakan warna dari palet token
- [ ] Font sesuai hierarki (display / sans / mono)
- [ ] Hover state: perubahan border atau background, bukan shadow
- [ ] Focus state: `ring-2 ring-ink/30` atau `border-ink`
- [ ] Responsif: layout berubah, tapi tetap kotak
