import OpenAI from 'openai';
import { config } from '../config/env.js';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: config.deepseek.apiKey,
});

export function sanitizeAIOutput(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function generateCoverLetter({ position, company, companyField, infoSource, recipientTitle, highlights, cvData, personal, relevantExperience }) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten profesional pembuat surat lamaran kerja formal dalam Bahasa Indonesia.

Data pelamar:
- Nama: ${personal?.name || cvData?.personal?.name || 'tidak diketahui'}
- Tempat, tgl lahir: ${personal?.birthPlace || ''}${personal?.birthDate ? `, ${personal.birthDate}` : ''}
- Pendidikan terakhir: ${personal?.lastEducation || (cvData?.educations?.[0]?.degree ? cvData.educations[0].degree + ' ' + (cvData.educations[0].field || '') : '')}
- Pengalaman relevan: ${relevantExperience || cvData?.experiences?.[0]?.position || ''} ${cvData?.experiences?.[0]?.company ? 'di ' + cvData.experiences[0].company : ''}
- Ringkasan profil: ${cvData?.summary || 'tidak ada'}

Data lamaran:
- Posisi yang dilamar: ${position}
- Nama perusahaan: ${company}
- Bidang perusahaan: ${companyField || 'tidak disebutkan'}
- Sumber info lowongan: ${infoSource}
- Poin yang ingin ditonjolkan: ${highlights?.join(', ')}

INSTRUKSI WAJIB:
1. Tulis HANYA 3 paragraf isi surat (naratif). Jangan tulis salam pembuka, data diri, daftar lampiran, atau tanda tangan.
2. Paragraf 1: perkenalan singkat + posisi yang dilamar + sumber info lowongan (gunakan nilai nyata).
3. Paragraf 2: ceritakan pengalaman dan keahlian relevan (gunakan data nyata pelamar, termasuk pengalaman dan poin highlights).
4. Paragraf 3: motivasi melamar ke perusahaan ini (sebutkan nama perusahaan dan bidangnya) + komitmen kontribusi.
5. Gunakan data nyata di atas — DILARANG menulis placeholder seperti [Nama] atau [sebutkan].
6. DILARANG menggunakan tanda bintang (**), markdown, atau simbol formatting apapun.
7. Pisahkan setiap paragraf dengan satu baris kosong.
8. Tone formal, sopan, percaya diri. Tidak ada kalimat klise seperti "saya sangat antusias".
9. Tidak ada kalimat yang meminta konfirmasi, pertanyaan, atau sapaan pembuka/penutup.`,
      },
    ],
    max_tokens: 700,
    temperature: 0.65,
  });

  return sanitizeAIOutput(response.choices[0].message.content);
}

export async function recommendSkills({ position, existingSkills = [] }) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Kamu adalah konsultan karier dan tech recruiter profesional.
Berdasarkan posisi pekerjaan "${position}", rekomendasikan 8-12 keahlian teknis (technical skills) yang paling relevan dan banyak dicari di pasar kerja untuk posisi tersebut.

${existingSkills.length > 0 ? `Hindari duplikasi dengan keahlian yang sudah dimiliki kandidat: ${existingSkills.join(', ')}.` : ''}

Keahlian bisa berupa: bahasa pemrograman, framework, library, tools, database, platform, metodologi (Agile, Scrum, CI/CD, dll), soft skill teknis (problem solving, dll), atau sertifikat.

FORMAT OUTPUT: kembalikan HANYA array JSON valid berisi string keahlian, tanpa penjelasan, tanpa markdown, tanpa tanda bintang.
Contoh format:
["React.js", "Node.js", "PostgreSQL", "Docker", "AWS", "Git", "REST API", "Agile"]

Setiap item: singkat (1-3 kata), spesifik, nama teknologi/tool yang recognised industri. Gunakan bahasa Inggris untuk nama teknologi (React, bukan React.js dalam beberapa kasus), dan Bahasa Indonesia untuk soft skill metodologi.`,
      },
    ],
    max_tokens: 300,
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

export async function recommendHighlights({ position, cvData }) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Kamu adalah konsultan karier profesional.
Berdasarkan posisi "${position}" dan data profil kandidat berikut:
${cvData ? JSON.stringify({ summary: cvData.summary, skills: cvData.skills, experiences: cvData.experiences?.map(e => e.position + ' di ' + e.company) }) : 'tidak ada data CV'}

Rekomendasikan 6 poin kekuatan/pencapaian yang paling relevan untuk ditonjolkan dalam surat lamaran posisi ini.

FORMAT OUTPUT: kembalikan HANYA array JSON valid, tanpa penjelasan, tanpa markdown, tanpa tanda bintang.
Contoh format:
["Pengalaman 2,5 tahun administrasi keuangan zero-error", "Terampil Microsoft Excel otomatisasi", ...]

Setiap poin: singkat (maks 10 kata), spesifik, menggunakan data nyata jika tersedia.`,
      },
    ],
    max_tokens: 300,
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

export async function generateProfileSummary({ experiences, skills, targetPosition, tone = 'profesional', language = 'id' }) {
  const toneMap = {
    profesional: 'formal dan terstruktur',
    'percaya-diri': 'tegas dan menonjolkan pencapaian',
    adaptif: 'fleksibel dan terbuka terhadap berbagai peluang',
  };

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten CV profesional.
Buat ringkasan profil untuk CV dalam ${language === 'en' ? 'Bahasa Inggris' : 'Bahasa Indonesia'}.

Ketentuan:
- Maksimal 3 kalimat, padat dan langsung ke inti
- Tone: ${toneMap[tone] || toneMap.profesional}
- Sesuaikan dengan target posisi: ${targetPosition}
- Sertakan tahun pengalaman jika ada di data
- Sertakan pencapaian kuantitatif jika ada (contoh: "zero-error selama 2,5 tahun", "50+ staf")
- ATS-friendly: gunakan kata kunci yang relevan dengan posisi ${targetPosition}
- Hanya kembalikan teks ringkasan saja, tanpa label, tanpa tanda bintang (**)`,
      },
      {
        role: 'user',
        content: `Pengalaman: ${JSON.stringify(experiences)}
Keahlian: ${JSON.stringify(skills)}
Target posisi: ${targetPosition}`,
      },
    ],
    max_tokens: 250,
    temperature: 0.65,
  });

  return response.choices[0].message.content;
}
