# PRD — Generator Surat Lamaran Kerja
**Product Requirements Document**
**Versi:** 1.0
**Tanggal:** 12 Juni 2026
**Status:** Draft

---

## 1. Ringkasan Eksekutif

Generator Surat Lamaran Kerja adalah fitur berbasis AI yang menghasilkan surat lamaran kerja formal dalam format dokumen siap cetak/kirim. Saat ini sistem hanya menghasilkan paragraf teks polos di dalam text area. Target output adalah surat lamaran kerja berformat lengkap sesuai standar surat resmi Indonesia — dengan kop, identitas pelamar, isi surat, dan tanda tangan — yang dapat diunduh sebagai PDF.

---

## 2. Latar Belakang & Masalah

### 2.1 Masalah Saat Ini

| Aspek | Output Sekarang (Gambar 2) | Output yang Diinginkan (Gambar 1) |
|---|---|---|
| Format | Teks paragraf polos di text area | Surat resmi berformat dokumen |
| Identitas Pelamar | Tidak ditampilkan | Ditampilkan lengkap (nama, TTL, alamat, HP, email, portofolio) |
| Struktur Surat | Tidak ada (hanya 3 paragraf mengalir) | Kop tanggal, kepada, pembuka, data diri, isi, penutup, tanda tangan |
| Informasi Posisi | Tersebut hanya di isi paragraf | Di-bold dan eksplisit: **STAF ADMIN PEMBANGKIT** |
| Lampiran | Tidak disebutkan | Tercantum eksplisit (CV, Pas Foto, KTP, Ijazah, Transkrip) |
| Download | Download PDF (teks mentah) | Download PDF (dokumen terformat) |

### 2.2 Dampak Masalah

Output saat ini tidak dapat langsung digunakan untuk melamar kerja. Pengguna harus menyalin teks, membuka Word/Google Docs, mengatur format sendiri, lalu mencetak — menambah 15–30 menit kerja manual. Ini menghilangkan nilai utama produk sebagai "generator surat siap pakai."

---

## 3. Tujuan Produk

- **Primary Goal:** Menghasilkan surat lamaran kerja dalam format dokumen resmi yang langsung bisa diunduh dan dikirimkan ke HRD.
- **Secondary Goal:** Mengurangi waktu pembuatan surat dari ~30 menit (manual) menjadi < 2 menit.
- **Success Metric:** Pengguna dapat mengunduh PDF surat lamaran yang sudah terformat dan siap kirim tanpa perlu editing tambahan.

---

## 4. Pengguna Target

**Persona Utama:** Pencari kerja fresh graduate atau profesional yang ingin membuat surat lamaran kerja formal dengan cepat, terutama yang tidak familiar dengan format surat resmi Indonesia.

---

## 5. User Stories

| ID | Sebagai | Saya ingin | Sehingga |
|---|---|---|---|
| US-01 | Pelamar kerja | Mengisi form data diri dan posisi yang dilamar | AI bisa generate surat yang personal |
| US-02 | Pelamar kerja | Melihat preview surat lamaran yang sudah terformat | Saya bisa memastikan isi sebelum download |
| US-03 | Pelamar kerja | Mengunduh surat sebagai PDF berformat dokumen resmi | Saya bisa langsung kirim ke HRD tanpa edit tambahan |
| US-04 | Pelamar kerja | Melihat data identitas saya terpisah dan terstruktur di surat | Surat terlihat profesional dan mudah dibaca HRD |
| US-05 | Pelamar kerja | Memilih daftar lampiran yang akan disertakan | Surat mencantumkan dokumen persyaratan yang relevan |

---

## 6. Spesifikasi Fungsional

### 6.1 Input Form (Sebelum Generate)

Form wajib mengumpulkan data berikut sebelum AI dijalankan:

**Blok A — Data Pelamar:**
- Nama Lengkap *(required)*
- Tempat, Tanggal Lahir *(required)*
- Jenis Kelamin *(required, dropdown: Laki-laki / Perempuan)*
- Pendidikan Terakhir *(required)*
- Alamat *(required)*
- Nomor HP *(required)*
- E-mail *(required)*
- Portofolio / Website *(optional)*

**Blok B — Data Lamaran:**
- Nama Perusahaan *(required)*
- Divisi / Departemen Tujuan *(required, contoh: HRD)*
- Posisi yang Dilamar *(required — akan di-bold di surat)*
- Sumber Informasi Lowongan *(optional, contoh: LinkedIn, website perusahaan)*
- Pengalaman Kerja Relevan *(optional, untuk konteks AI)*

**Blok C — Lampiran:**
- Checklist lampiran yang akan disertakan:
  - [ ] CV
  - [ ] Pas Foto
  - [ ] KTP
  - [ ] Ijazah
  - [ ] Transkrip
  - [ ] Sertifikat (optional)
  - [ ] Lainnya (text input)

**Blok D — Lokasi & Tanggal:**
- Kota penulisan surat *(required, default: kota user)*
- Tanggal surat *(required, default: hari ini)*

---

### 6.2 Proses AI Generation

AI (Claude) menerima semua data form dan menghasilkan **paragraf isi surat** (bukan seluruh surat). Sistem front-end yang menyusun struktur dokumen lengkap.

**Prompt AI harus menghasilkan:**
- Paragraf pembuka: menyebutkan sumber informasi lowongan dan posisi yang dilamar
- Paragraf tengah: mendeskripsikan pengalaman/kompetensi relevan pelamar
- Paragraf penutup: motivasi bergabung + komitmen kontribusi

**Batasan AI:**
- AI **tidak** menghasilkan bagian: tanggal, kepada, identitas tabel, daftar lampiran, tanda tangan — semua itu di-render oleh sistem menggunakan data form.
- Nama posisi di-bold otomatis oleh sistem, bukan oleh AI.

---

### 6.3 Struktur Output Surat (Dokumen Final)

Output harus merefleksikan format surat resmi Indonesia seperti pada Gambar 1:

```
[KOTA], [TANGGAL]                                    (rata kanan)

Kepada Yth.
[DIVISI]
Di [NAMA PERUSAHAAN]

Dengan hormat,

Saya yang bertanda tangan di bawah ini :

Nama              : [NAMA]
Tempat, tanggal lahir  : [TTL]
Jenis Kelamin     : [JK]
Pendidikan Terakhir : [PENDIDIKAN]
Alamat            : [ALAMAT]
Nomor HP          : [NO HP]
E-mail            : [EMAIL]
Portofolio        : [PORTOFOLIO]                     (jika diisi)

Dengan ini mengajukan lamaran sebagai **[POSISI]**, Bersama
ini saya lampirkan dokumen persyaratan sebagai berikut:

    1. [Lampiran 1]
    2. [Lampiran 2]
    ... dst sesuai checklist

    [PARAGRAF PENUTUP DARI AI]

                                        Hormat saya,



                                        ([NAMA LENGKAP])
```

---

### 6.4 Preview Surat

- Setelah AI selesai generate, sistem langsung menampilkan **preview dokumen** (bukan text area).
- Preview ditampilkan dalam container bergaya halaman A4 (putih, shadow, padding surat resmi).
- Posisi dilamar tampil dalam **huruf kapital bold**.
- Email dan Portofolio tampil sebagai link yang dapat diklik.
- Daftar lampiran tampil sebagai numbered list.

---

### 6.5 Download PDF

- Tombol "Download PDF" menghasilkan PDF yang layout-nya **identik** dengan preview.
- Nama file default: `Surat_Lamaran_[NAMA]_[PERUSAHAAN].pdf`
- PDF harus menggunakan font serif (Times New Roman atau setara) untuk kesan formal.
- Margin dokumen: atas 2.5cm, bawah 2.5cm, kiri 3cm, kanan 2.5cm (standar surat resmi Indonesia).

---

### 6.6 Tombol Salin

- Tombol "Salin" menyalin **teks plain** surat (tanpa formatting HTML) ke clipboard.
- Berguna untuk pengguna yang ingin paste ke Word/Google Docs secara manual.

---

## 7. Spesifikasi Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| **Performa** | Waktu generate AI < 10 detik |
| **Aksesibilitas** | Preview harus readable di mobile (font minimum 12px) |
| **Konsistensi** | Setiap generate dengan data sama harus menghasilkan struktur dokumen yang sama (hanya isi paragraf yang bervariasi) |
| **Validasi** | Form tidak bisa di-submit jika field required kosong |
| **Bahasa** | Output surat selalu dalam Bahasa Indonesia formal |

---

## 8. Perbandingan Before / After

### Before (Output Saat Ini — Gambar 2)
```
┌─────────────────────────────────────────────┐
│ Hasil Surat              [Salin] [Download PDF] │
├─────────────────────────────────────────────┤
│ Melalui informasi lowongan yang saya peroleh│
│ dari LinkedIn, saya mengajukan diri sebagai │
│ kandidat untuk posisi Admin di PT HAHAH...  │
│                                             │
│ [text area biasa, tidak terformat]          │
└─────────────────────────────────────────────┘
```

### After (Output yang Diinginkan — Gambar 1)
```
┌─────────────────────────────────────────────┐
│                          Barru, 12 Juni 2026│
│                                             │
│ Kepada Yth.                                 │
│ HRD                                         │
│ Di PT PAGUNTAKA CAHAYA NUSANTARA            │
│                                             │
│ Dengan hormat,                              │
│                                             │
│ Saya yang bertanda tangan di bawah ini :    │
│ Nama              : Muh. Zulkifli           │
│ Tempat, tgl lahir : Cilellang, 14 Feb 2003  │
│ ...                                         │
│                                             │
│ Dengan ini mengajukan lamaran sebagai       │
│ STAF ADMIN PEMBANGKIT, Bersama ini...       │
│   1. CV                                     │
│   2. Pas Foto                               │
│   3. KTP    ...                             │
│                                             │
│                         Hormat saya,        │
│                         (Muh Zulkifli)      │
└─────────────────────────────────────────────┘
       [Salin]              [Download PDF]
```

---

## 9. Perbedaan Arsitektur

### Saat Ini
```
Form Input → AI Generate → Seluruh teks surat → Tampil di <textarea>
```

### Yang Diinginkan
```
Form Input → AI Generate → Hanya paragraf isi
                        ↓
              Sistem render struktur surat:
              [Tanggal] + [Kepada] + [Identitas Tabel]
              + [Paragraf AI] + [Lampiran] + [TTD]
                        ↓
              Preview dokumen A4 + Download PDF
```

**Kunci perubahan:** AI hanya bertugas menghasilkan *konten naratif* (3 paragraf). Struktur, tabel identitas, dan formatting dokumen adalah tanggung jawab sistem, bukan AI.

---

## 10. Out of Scope (Versi 1.0)

- Upload foto tanda tangan digital
- Template surat bergaya (minimalis, formal, kreatif)
- Multi-bahasa (Inggris, dll)
- Penyimpanan riwayat surat
- Pengiriman langsung ke email HRD

---

## 11. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Surat yang dihasilkan memiliki tanggal di kanan atas
- [ ] Surat menampilkan blok "Kepada Yth." dengan nama divisi dan perusahaan
- [ ] Tabel identitas pelamar tampil dengan format `Label : Nilai` (kolom rata)
- [ ] Nama posisi tampil **bold dan kapital** di badan surat
- [ ] Daftar lampiran tampil sebagai numbered list sesuai checklist user
- [ ] Surat diakhiri dengan "Hormat saya," diikuti nama dalam tanda kurung
- [ ] PDF yang diunduh layout-nya identik dengan preview
- [ ] Seluruh alur berjalan tanpa perlu refresh halaman

---

*Dokumen ini disiapkan sebagai panduan pengembangan fitur Generator Surat Lamaran Kerja.*