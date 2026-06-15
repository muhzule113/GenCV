export const ATS_RULES = [
  'Gunakan font standar (Helvetica, Arial, atau Times New Roman)',
  'Layout satu kolom, tanpa tabel atau kolom ganda',
  'Tidak ada gambar, foto, grafik, atau ikon dekoratif',
  'Urutan section: Ringkasan → Pengalaman → Pendidikan → Keahlian',
  'Format tanggal konsisten (contoh: Jan 2023 – Mar 2024)',
  'Heading section jelas dan konsisten (uppercase atau bold)',
  'Bullet point menggunakan karakter • standar',
  'Margin minimum 2.54 cm di semua sisi',
  'Nama file PDF tanpa spasi',
]

export const checkATSRules = (data) => {
  const warnings = []
  if (!data.personal?.name) warnings.push('Nama belum diisi')
  if (!data.personal?.email) warnings.push('Email belum diisi')
  if (data.experiences?.length === 0 && data.projects?.length === 0) {
    warnings.push('Minimal memiliki pengalaman atau proyek')
  }
  return warnings
}
