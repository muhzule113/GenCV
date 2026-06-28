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

// --- ATS Score Engine ---
// 5 categories, each 0-20 points → total 0-100

const CATEGORIES = {
  personal: { label: 'Data Diri', weight: 20 },
  experience: { label: 'Pengalaman', weight: 20 },
  education: { label: 'Pendidikan', weight: 15 },
  skills: { label: 'Keahlian', weight: 20 },
  content: { label: 'Konten & Format', weight: 25 },
}

function scorePersonal(p = {}) {
  const checks = [
    { ok: !!p.name?.trim(), tip: 'Tambahkan nama lengkap', pts: 4 },
    { ok: !!p.email?.trim(), tip: 'Tambahkan email', pts: 4 },
    { ok: !!p.phone?.trim(), tip: 'Tambahkan nomor telepon', pts: 3 },
    { ok: !!p.city?.trim(), tip: 'Tambahkan kota domisili', pts: 3 },
    { ok: !!p.jobTitle?.trim(), tip: 'Tambahkan judul/posisi target', pts: 3 },
    { ok: !!(p.linkedin?.trim() || p.github?.trim() || p.portfolio?.trim()), tip: 'Tambahkan minimal satu link profesional (LinkedIn/GitHub/Portfolio)', pts: 3 },
  ]
  return evaluate(checks, CATEGORIES.personal.weight)
}

function scoreExperience(exps = []) {
  if (exps.length === 0) return { score: 0, max: CATEGORIES.experience.weight, tips: ['Tambahkan minimal satu pengalaman kerja atau magang'] }
  const checks = [
    { ok: exps.length >= 1, tip: 'Tambahkan pengalaman kerja', pts: 5 },
    { ok: exps.length >= 2, tip: 'Lebih dari satu pengalaman meningkatkan kredibilitas', pts: 3 },
    { ok: exps.every(e => e.company?.trim() && e.position?.trim()), tip: 'Lengkapi nama perusahaan dan posisi di semua pengalaman', pts: 4 },
    { ok: exps.every(e => e.start_date), tip: 'Tambahkan tanggal mulai di semua pengalaman', pts: 3 },
    { ok: exps.some(e => e.description?.length > 0 || (typeof e.description === 'string' && e.description.trim())), tip: 'Tambahkan deskripsi tugas/pencapaian di pengalaman', pts: 5 },
  ]
  return evaluate(checks, CATEGORIES.experience.weight)
}

function scoreEducation(edus = []) {
  if (edus.length === 0) return { score: 0, max: CATEGORIES.education.weight, tips: ['Tambahkan riwayat pendidikan'] }
  const checks = [
    { ok: edus.length >= 1, tip: 'Tambahkan pendidikan', pts: 5 },
    { ok: edus.every(e => e.institution?.trim()), tip: 'Lengkapi nama institusi pendidikan', pts: 4 },
    { ok: edus.every(e => e.degree?.trim()), tip: 'Tambahkan gelar/jenjang pendidikan', pts: 3 },
    { ok: edus.some(e => e.gpa), tip: 'Cantumkan IPK jika >= 3.0', pts: 3 },
  ]
  return evaluate(checks, CATEGORIES.education.weight)
}

function scoreSkills(skills = {}) {
  const tech = skills.technical || []
  const soft = skills.soft || []
  const checks = [
    { ok: tech.length >= 3, tip: 'Tambahkan minimal 3 keahlian teknis', pts: 6 },
    { ok: tech.length >= 6, tip: 'Idealnya 6-12 keahlian teknis relevan', pts: 4 },
    { ok: soft.length >= 1 || (typeof skills.soft === 'string' && skills.soft.trim()), tip: 'Tambahkan soft skills', pts: 4 },
    { ok: tech.length + soft.length >= 5, tip: 'Total keahlian minimal 5 untuk ATS', pts: 6 },
  ]
  return evaluate(checks, CATEGORIES.skills.weight)
}

function scoreContent(data = {}) {
  const summary = data.summary || ''
  const exps = data.experiences || []
  const hasBullets = exps.some(e => Array.isArray(e.description) ? e.description.length >= 2 : false)
  const summaryLen = summary.trim().length

  const checks = [
    { ok: summaryLen >= 50, tip: 'Tulis ringkasan profil minimal 50 karakter', pts: 5 },
    { ok: summaryLen >= 100 && summaryLen <= 500, tip: 'Ringkasan ideal 100-500 karakter', pts: 3 },
    { ok: hasBullets, tip: 'Gunakan minimal 2 bullet point di deskripsi pengalaman', pts: 5 },
    { ok: exps.some(e => {
      const desc = Array.isArray(e.description) ? e.description.join(' ') : (e.description || '')
      return /\d+/.test(desc) // contains numbers/metrics
    }), tip: 'Tambahkan angka/metrik di deskripsi (contoh: "meningkatkan 30%")', pts: 5 },
    { ok: !!(data.projects?.length || data.certifications?.length), tip: 'Tambahkan proyek atau sertifikasi untuk nilai tambah', pts: 4 },
    { ok: !!data.personal?.jobTitle?.trim(), tip: 'Judul posisi target membantu ATS mencocokkan profil', pts: 3 },
  ]
  return evaluate(checks, CATEGORIES.content.weight)
}

function evaluate(checks, maxPts) {
  let earned = 0
  const tips = []
  const totalCheckPts = checks.reduce((s, c) => s + c.pts, 0)
  for (const c of checks) {
    if (c.ok) earned += c.pts
    else tips.push(c.tip)
  }
  // scale to maxPts
  const score = totalCheckPts > 0 ? Math.round((earned / totalCheckPts) * maxPts) : 0
  return { score, max: maxPts, tips }
}

/**
 * Calculate ATS score for CV data.
 * Returns { total, grade, categories: { personal, experience, education, skills, content } }
 * Each category: { label, score, max, tips }
 */
export function calculateATSScore(data = {}) {
  const results = {
    personal: { label: CATEGORIES.personal.label, ...scorePersonal(data.personal) },
    experience: { label: CATEGORIES.experience.label, ...scoreExperience(data.experiences) },
    education: { label: CATEGORIES.education.label, ...scoreEducation(data.educations) },
    skills: { label: CATEGORIES.skills.label, ...scoreSkills(data.skills) },
    content: { label: CATEGORIES.content.label, ...scoreContent(data) },
  }

  const total = Object.values(results).reduce((s, r) => s + r.score, 0)
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 50 ? 'C' : 'D'

  return { total, grade, categories: results }
}
