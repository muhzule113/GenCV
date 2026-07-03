const FIELD_MAP = {
  'nama|name|fullName|namaLengkap': 'name',
  'email|surel|e-mail': 'email',
  'phone|telp|telepon|nohp|no_hp|phoneNumber|mobile': 'phone',
  'jobTitle|jabatan|posisi|title|position': 'jobTitle',
  'city|kota|kabupaten': 'city',
  'address|alamat': 'address',
  'birthPlace|tempatLahir|tempat_lahir': 'birthPlace',
  'birthDate|tanggalLahir|tglLahir|tanggal_lahir|birthDate': 'birthDate',
  'gender|jenisKelamin|jenis_kelamin|sex': 'gender',
  'lastEducation|pendidikanTerakhir|pendidikan_terakhir|last_education': 'lastEducation',
  'linkedin|linkedIn': 'linkedin',
  'github': 'github',
  'portfolio|website|portofolio|url': 'portfolio',
  'summary|ringkasan|tentang|about|profil|profile': 'summary',
}

function normalizeKey(key) {
  const clean = String(key).toLowerCase().trim()
  for (const [patterns, target] of Object.entries(FIELD_MAP)) {
    if (new RegExp(patterns.split('|').join('$|^'), 'i').test(`^${clean}$`)) {
      return target
    }
  }
  return null
}

function mapPersonal(obj) {
  const result = {}
  if (typeof obj !== 'object' || !obj) return result

  for (const [key, value] of Object.entries(obj)) {
    const mapped = normalizeKey(key)
    if (mapped) result[mapped] = String(value)
    else result[key] = String(value)
  }
  return result
}

function mapExperiences(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((exp) => ({
    company: exp.company || exp.nama || exp.organization || '',
    position: exp.position || exp.posisi || exp.jobTitle || exp.title || exp.Job || '',
    startDate: exp.startDate || exp.start_date || exp.dari || '',
    endDate: exp.endDate || exp.end_date || exp.sampai || '',
    isCurrent: exp.isCurrent || exp.is_current || exp.saatIni || false,
    description: Array.isArray(exp.description || exp.deskripsi || exp.achievements || exp.bullets)
      ? (exp.description || exp.deskripsi || exp.achievements || exp.bullets)
      : [],
  }))
}

function mapEducation(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((edu) => ({
    institution: edu.institution || edu.institusi || edu.school || edu.university || edu.kampus || '',
    degree: edu.degree || edu.gelar || edu.level || '',
    field: edu.field || edu.jurusan || edu.major || edu.bidang || '',
    startYear: edu.startYear || edu.start_year || edu.tahunMulai || '',
    endYear: edu.endYear || edu.end_year || edu.tahunLulus || edu.tahunSelesai || '',
    gpa: edu.gpa || edu.ipk || '',
    thesis: edu.thesis || edu.skripsi || edu.tugasAkhir || '',
  }))
}

function mapSkills(skills) {
  if (typeof skills === 'object' && !Array.isArray(skills)) {
    return {
      technical: Array.isArray(skills.technical || skills.teknis) ? skills.technical || skills.teknis : [],
      soft: Array.isArray(skills.soft || skills.interpersonal || skills.softSkills || skills.soft_skills) ? (skills.soft || skills.interpersonal || skills.softSkills || skills.soft_skills) : [],
    }
  }
  if (Array.isArray(skills)) {
    return { technical: skills, soft: [] }
  }
  return { technical: [], soft: [] }
}

function mapProjects(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((proj) => ({
    name: proj.name || proj.nama || proj.title || '',
    description: proj.description || proj.deskripsi || proj.summary || '',
    techStack: Array.isArray(proj.techStack || proj.tech_stack || proj.technologies || proj.tech) ? (proj.techStack || proj.tech_stack || proj.technologies || proj.tech) : [],
    period: proj.period || proj.periode || proj.date || '',
  }))
}

function mapCertifications(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((cert) => ({
    name: cert.name || cert.nama || cert.title || '',
    issuer: cert.issuer || cert.penerbit || cert.organization || cert.organization || '',
  }))
}

function mapLanguages(arr) {
  if (!Array.isArray(arr)) return []
  return arr.map((l) => ({
    name: typeof l === 'string' ? l : (l.name || l.nama || l.bahasa || l.language || ''),
    level: typeof l === 'string' ? '' : (l.level || l.tingkat || l.proficiency || ''),
  }))
}

export function parseCVImport(data) {
  const parsed = typeof data === 'string' ? JSON.parse(data) : data
  if (!parsed || typeof parsed !== 'object') throw new Error('Format JSON tidak valid')

  return {
    personal: mapPersonal(parsed.personal || parsed.profile || parsed),
    summary: parsed.summary || parsed.ringkasan || parsed.professionalSummary || '',
    experiences: mapExperiences(parsed.experiences || parsed.experience || parsed.pengalaman || parsed.workExperience),
    educations: mapEducation(parsed.educations || parsed.education || parsed.pendidikan || parsed.educationHistory),
    skills: mapSkills(parsed.skills || parsed.keahlian || parsed.skill || parsed.technicalSkills),
    projects: mapProjects(parsed.projects || parsed.project || parsed.proyek),
    certifications: mapCertifications(parsed.certifications || parsed.certification || parsed.sertifikasi || parsed.certs),
    languages: mapLanguages(parsed.languages || parsed.language || parsed.bahasa),
  }
}

export function parseLinkedInJSON(data) {
  const parsed = typeof data === 'string' ? JSON.parse(data) : data
  if (!parsed || typeof parsed !== 'object') throw new Error('Format LinkedIn JSON tidak valid')

  return {
    personal: {
      name: `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim(),
      jobTitle: parsed.headline || parsed.title || '',
      email: parsed.email || parsed.emailAddress || '',
      phone: parsed.phone || parsed.phoneNumbers?.[0]?.number || '',
      city: `${parsed.location?.city || ''} ${parsed.location?.country || ''}`.trim(),
      linkedin: parsed.linkedIn || parsed.publicProfileUrl || '',
      github: parsed.github || '',
      portfolio: parsed.website || parsed.portfolio || '',
    },
    summary: parsed.summary || parsed.about || parsed.description || '',
    experiences: mapExperiences(parsed.experience || parsed.positions || parsed.workHistory),
    educations: mapEducation(parsed.education || parsed.educations || parsed.educationHistory),
    skills: mapSkills(parsed.skills || parsed.skill || []),
    projects: mapProjects(parsed.projects || []),
    certifications: mapCertifications(parsed.certifications || []),
    languages: mapLanguages(parsed.languages || []),
  }
}
