# Spesifikasi 10 Template CV Minimalis — Project GenCV

Dokumen ini adalah spesifikasi teknis untuk menambah koleksi template CV di project **GenCV**, disesuaikan dengan struktur kode yang sudah ada di repo (`muhzule113/GenCV`).

## Konteks dari Repo

- Setiap template = 1 komponen React di `src/components/cv/templates/*.jsx`, dirender dengan `@react-pdf/renderer` (`Document`, `Page`, `View`, `Text`, `StyleSheet`).
- Template didaftarkan di `src/data/dummyData.js` pada array `dummyTemplates` (`id`, `name`, `description`, `is_active`).
- Thumbnail preview-nya diatur manual di `TemplatePicker.jsx` (object `thumbnailStyles` + kondisi render per `id`).
- `PRD.md` bagian **"Rules ATS yang Harus Dipenuhi"** mewajibkan: font Helvetica/Arial/Times New Roman, satu kolom, tanpa gambar/ikon dekoratif, urutan section Ringkasan → Pengalaman → Pendidikan → Keahlian, format tanggal konsisten, margin ±1 inch.
- Saat ini ada 4 template: `ats-clean-v1`, `ats-modern-v1` (relatif minimalis), serta `modern-tech-v1` dan `creative-v1` (sidebar gelap + warna violet/biru cukup mencolok — ini kandidat utama untuk dibuat versi minimalis-nya).

Sesuai permintaan kamu — **tidak banyak warna/corak** — semua 10 template di bawah ini membatasi diri pada:
- Maksimal **1 warna aksen** (dipakai tipis, misalnya di garis bawah judul section atau nama), sisanya hitam/abu-abu/putih.
- Tidak ada background warna solid penuh satu halaman, tidak ada ikon, tidak ada foto.
- Tetap patuh aturan ATS di `PRD.md` (kecuali disebutkan "non-ATS" secara eksplisit untuk template kreatif ringan).

---

## Skema Data yang Dipakai (sama untuk semua template)

```
data.personal = { name, jobTitle, city, phone, email, linkedin, github, portfolio }
data.summary  = string
data.experiences[] = { position, company, startDate|start_date, endDate|end_date, isCurrent, description[] }
data.educations[]  = { degree, institution, startYear|start_year, endYear|end_year, field, gpa, thesis }
data.skills = { technical: [] | [{name, level}], soft: [] , interpersonal: [] }
data.certifications[] = { name, issuer }
data.languages[]  = { name, level }
data.projects[]   = { name, period | startDate/endDate, techStack|tech_stack[], description }
```

Gunakan helper yang sama seperti template lama (`formatDate`, `formatPeriod`, `getSkills`) supaya konsisten — bisa dipindah ke satu file `src/components/cv/templates/utils.js` agar tidak duplikat di 10 file baru.

---

## 1. `ats-clean-v1` (sudah ada — pertahankan)
**Status:** sudah sesuai, tidak perlu diubah banyak.
- 1 kolom, hitam-putih murni, tanpa aksen warna sama sekali.
- Font: Helvetica. Section title: uppercase + border-bottom tipis abu (`#999`, bukan biru).
- **Rekomendasi kecil:** ganti `borderBottomColor: '#1D4ED8'` jadi abu netral (`#999999`) supaya benar-benar 0 warna.

## 2. `ats-modern-minimal-v1` (revisi dari `ats-modern-v1`)
Versi "modern" tapi dikurangi warnanya — bukan header blok biru penuh.
- Nama + jobTitle rata kiri (bukan center block warna).
- Aksen warna **hanya** di garis tipis 2px di bawah nama (`accent: #334155` slate gelap, bukan biru terang `#1D4ED8`).
- Section title tetap hitam bold uppercase, tanpa warna.
- File baru: `ATSModernMinimalTemplate.jsx`.

## 3. `executive-serif-v1`
Untuk level senior/eksekutif, kesan formal.
- Font: `Times-Roman` (built-in react-pdf), bukan Helvetica.
- 1 kolom, spasi antar-section lebih lega (`marginTop: 18`).
- Section title: kapital kecil + letter-spacing, warna hitam penuh (0 aksen warna).
- Garis pemisah horizontal tipis (`borderBottomWidth: 0.5, borderBottomColor: '#000'`) antar section, bukan warna.
- File: `ExecutiveSerifTemplate.jsx`.

## 4. `compact-onepage-v1`
Untuk CV super ringkas 1 halaman (fresh grad / entry level dengan sedikit pengalaman).
- Font size lebih kecil (9pt body, 10pt heading), padding halaman diperkecil jadi 28.
- Tidak ada spasi kosong berlebih antar section (`marginBottom` dikecilkan).
- 0 warna — hanya bold + uppercase untuk hierarki.
- File: `CompactOnePageTemplate.jsx`.

## 5. `sidebar-slim-v1`
Alternatif minimalis dari `modern-tech-v1` (yang sidebar-nya gelap & biru terang).
- Sidebar selebar ~28% dengan background **abu sangat muda** (`#F4F4F5`), bukan gelap/dark.
- Sidebar berisi: kontak, skill, bahasa, sertifikasi. Kolom utama: ringkasan, pengalaman, pendidikan, proyek.
- Tidak ada icon di sidebar (icon dianggap "dekoratif", melanggar rules ATS) — ganti dengan label teks biasa.
- 1 aksen warna maksimal, dipakai di garis tipis pemisah sidebar (`#D4D4D8`), bukan warna solid.
- File: `SidebarSlimTemplate.jsx`.
- **Catatan ATS:** karena 2 kolom, tandai template ini sebagai "non-ATS-strict" di `description` (mis. "Cocok untuk apply online form/portofolio, kurang ideal untuk parser ATS otomatis").

## 6. `academic-minimal-v1`
Untuk mahasiswa/peneliti — menambah section Publikasi & Presentasi yang belum ada di skema lama.
- 1 kolom, font Times-Roman, tanpa warna sama sekali.
- Section tambahan opsional: `data.publications[]` (`{authors, year, title, venue}`), `data.presentations[]` (`{title, event, year}`) — render kondisional seperti section lain (`data.publications?.length > 0 && (...)`).
- File: `AcademicMinimalTemplate.jsx`.

## 7. `technical-minimal-v1`
Alternatif minimalis untuk developer/engineer (pengganti nuansa `modern-tech-v1` yang terlalu ramai).
- Skill teknis ditampilkan sebagai daftar teks dipisah `·` (bukan bar/progress warna-warni).
- Section "Proyek" dinaikkan urutannya tepat setelah Pengalaman (khusus role teknis, proyek sering lebih relevan dari pendidikan).
- Font tetap Helvetica, hanya nama file/judul proyek yang bold, tanpa warna.
- File: `TechnicalMinimalTemplate.jsx`.

## 8. `fresh-graduate-minimal-v1`
Untuk lulusan baru — pendidikan & proyek/organisasi lebih menonjol dari pengalaman kerja.
- Urutan section khusus: Ringkasan → **Pendidikan** → Proyek/Tugas Akhir → Pengalaman Organisasi/Magang → Keahlian.
- Field tambahan opsional pada `educations[]`: `gpa` (sudah ada di skema), `organizations[]` (baru: `{role, name, period, description}`).
- 0 warna, hanya bold untuk judul.
- File: `FreshGraduateMinimalTemplate.jsx`.

## 9. `timeline-minimal-v1`
Pengalaman kerja ditampilkan dengan garis vertikal tipis di kiri sebagai penanda urutan waktu (bukan warna-warni, cuma garis abu `#CCC` + bullet titik hitam kecil).
- Cocok untuk kandidat dengan banyak riwayat kerja (>3 posisi) supaya progres karier terlihat jelas.
- 1 kolom tetap ATS-safe (garis dan bullet dibuat dengan `View` sederhana, bukan gambar/SVG).
- File: `TimelineMinimalTemplate.jsx`.

## 10. `two-tone-minimal-v1`
Versi paling "netral" sebagai penutup — cocok jadi default baru kalau ingin sedikit beda dari `ats-clean-v1` tanpa menambah warna.
- Palet: hitam (`#111827`) untuk teks utama, abu (`#6B7280`) untuk metadata (tanggal, perusahaan), **1 warna aksen** (`#0F172A` slate gelap, dipakai HANYA di 1 elemen: garis bawah nama di header).
- Selain itu identik strukturnya dengan `ats-clean-v1` (memudahkan reuse kode).
- File: `TwoToneMinimalTemplate.jsx`.

---

## Ringkasan Tabel

| # | id | Kolom | Font | Warna Aksen | Cocok Untuk |
|---|----|-------|------|-------------|--------------|
| 1 | ats-clean-v1 | 1 | Helvetica | Tidak ada | Umum / ATS strict |
| 2 | ats-modern-minimal-v1 | 1 | Helvetica | Slate tipis di garis nama | Umum, sedikit modern |
| 3 | executive-serif-v1 | 1 | Times-Roman | Tidak ada | Senior/eksekutif |
| 4 | compact-onepage-v1 | 1 | Helvetica | Tidak ada | Ringkas, 1 halaman |
| 5 | sidebar-slim-v1 | 2 | Helvetica | Garis abu tipis | Portofolio/non-ATS-strict |
| 6 | academic-minimal-v1 | 1 | Times-Roman | Tidak ada | Akademik/riset |
| 7 | technical-minimal-v1 | 1 | Helvetica | Tidak ada | Developer/engineer |
| 8 | fresh-graduate-minimal-v1 | 1 | Helvetica | Tidak ada | Fresh graduate |
| 9 | timeline-minimal-v1 | 1 | Helvetica | Garis abu (bukan warna) | Riwayat kerja panjang |
| 10 | two-tone-minimal-v1 | 1 | Helvetica | 1 aksen di header saja | Default alternatif |

---

## Langkah Implementasi di Repo

1. Buat file baru di `src/components/cv/templates/` sesuai nama di atas, meniru pola `ATSCleanTemplate.jsx` (import `Document, Page, Text, View, StyleSheet` dari `@react-pdf/renderer`, definisikan `styles` via `StyleSheet.create`, lalu komponen `export function XxxTemplate({ data })`).
2. Pindahkan `formatDate`, `formatPeriod`, `getSkills` ke `src/components/cv/templates/utils.js` supaya 10+ file tidak duplikasi kode.
3. Tambahkan masing-masing ke `dummyTemplates` di `src/data/dummyData.js`:
   ```js
   { id: 'executive-serif-v1', name: 'Executive Serif', description: 'Formal, font serif, tanpa warna', is_active: true },
   ```
4. Tambahkan mapping preview thumbnail baru di `TemplatePicker.jsx` (`thumbnailStyles`), pakai warna abu/netral konsisten dengan prinsip minimalis (hindari `bg-purple-950`, `bg-blue-500` seperti template lama).
5. Update bagian mapping template→component (biasanya di file yang me-render PDF, misalnya `CVPreview.jsx` atau sejenis — cek `grep -rn "ATSCleanTemplate" src/` untuk temukan titik importnya) supaya id baru terhubung ke komponen barunya.
6. Jalankan tes render dengan data dummy (`src/data/dummyData.js` biasanya juga punya `dummyCvData`) untuk memastikan tiap template tidak error saat field kosong (semua section harus dibungkus kondisional `data.xxx?.length > 0 && (...)`, sama seperti template lama).

---

## Catatan Tambahan

- Template **#5 (sidebar-slim-v1)** melanggar 1 aturan ATS di PRD (2 kolom), tapi tetap diikutkan karena user sering butuh opsi "agak modern" untuk kirim manual/portofolio — cukup diberi label jelas di UI bahwa ini bukan pilihan paling ATS-safe.
- Kalau target utamanya murni ATS-safe 100%, cukup pakai template **#1, #2, #3, #4, #6, #7, #8, #9, #10** (9 template 1-kolom) dan jadikan #5 opsional/terpisah kategori "Non-ATS".
- Semua template sebaiknya expose props tambahan (misalnya `accentColor`) supaya user bisa custom 1 warna aksen dari UI tanpa perlu bikin file baru untuk tiap variasi warna.