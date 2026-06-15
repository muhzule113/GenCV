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

export async function generateCoverLetter({ position, company, companyField, infoSource, recipientTitle, highlights, cvData }) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten profesional pembuat surat lamaran kerja formal dalam Bahasa Indonesia.

Data yang tersedia:
- Nama pelamar: ${cvData?.personal?.name || 'tidak diketahui'}
- Posisi yang dilamar: ${position}
- Nama perusahaan: ${company}
- Bidang perusahaan: ${companyField || 'tidak disebutkan'}
- Sumber info lowongan: ${infoSource}
- Poin yang ingin ditonjolkan: ${highlights?.join(', ')}
- Ringkasan profil: ${cvData?.summary || 'tidak ada'}
- Pengalaman terakhir: ${cvData?.experiences?.[0]?.position || ''} di ${cvData?.experiences?.[0]?.company || ''}

INSTRUKSI WAJIB:
1. Tulis HANYA isi paragraf surat (3 paragraf). Jangan tulis salam, data diri, atau penutup.
2. Gunakan data nyata di atas — DILARANG menulis placeholder seperti [Nama] atau [sebutkan].
3. DILARANG menggunakan tanda bintang (**) atau simbol markdown apapun.
4. Paragraf 1: perkenalan + posisi yang dilamar + sumber info lowongan (gunakan nilai nyata dari data).
5. Paragraf 2: ceritakan pengalaman dan keahlian relevan dari poin highlights (gunakan data nyata).
6. Paragraf 3: motivasi melamar ke perusahaan ini (sebutkan nama perusahaan dan bidang industrinya) + komitmen.
7. Tone formal, sopan, percaya diri. Tidak ada kalimat klise seperti "saya sangat antusias".
8. Tidak ada kalimat yang meminta konfirmasi atau bertanya balik.`,
      },
    ],
    max_tokens: 700,
    temperature: 0.65,
  });

  return sanitizeAIOutput(response.choices[0].message.content);
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
