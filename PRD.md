# PRD — CV ATS & Surat Lamaran Generator
**Product Requirements Document**
Versi: 3.0 | Tanggal: Juni 2026 | Status: Final Draft

---

## 1. Ringkasan Produk

### 1.1 Latar Belakang
Banyak pencari kerja kesulitan membuat CV yang lolos sistem ATS (Applicant Tracking System) dan surat lamaran yang profesional. Proses manual memakan waktu, dan hasilnya sering tidak optimal. Produk ini hadir sebagai solusi instan — pengguna cukup mengisi form, dan sistem menghasilkan dokumen siap kirim dalam hitungan detik.

### 1.2 Visi Produk
> *"Bantu setiap orang tampil profesional di atas kertas, dalam waktu kurang dari 5 menit."*

### 1.3 Tujuan Utama
- Mempercepat proses pembuatan CV berformat ATS-friendly
- Menghasilkan surat lamaran yang personal dan relevan dengan posisi yang dilamar
- Meminimalkan hambatan teknis bagi pengguna non-teknis
- Menyimpan riwayat dokumen pengguna yang bisa diakses kembali

---

## 2. Target Pengguna

| Segmen | Deskripsi |
|--------|-----------|
| **Fresh Graduate** | Baru lulus, belum berpengalaman membuat CV profesional |
| **Job Seeker Aktif** | Sedang melamar banyak posisi, butuh efisiensi |
| **Career Switcher** | Pindah industri, perlu menyesuaikan narasi CV |
| **Profesional Umum** | Sesekali update CV saat ada peluang menarik |

### User Persona Utama
**Reza, 23 tahun — Fresh Graduate Teknik Informatika**
- Baru lulus, melamar ke 10+ perusahaan sekaligus
- Tidak tahu format CV yang "aman" untuk ATS
- Ingin proses cepat tanpa harus belajar desain dokumen
- Menggunakan HP & laptop bergantian

---

## 3. Masalah yang Diselesaikan

1. **CV tidak lolos ATS** — Format kolom, tabel, dan gambar merusak parsing mesin
2. **Surat lamaran generik** — Tidak disesuaikan dengan posisi/perusahaan spesifik
3. **Waktu** — Membuat dari nol bisa memakan 1–3 jam
4. **Desain** — Tidak semua orang bisa menyusun dokumen yang rapi dan konsisten

---

## 4. Tech Stack

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| **Frontend** | React.js (Vite) | UI utama |
| **Styling** | Tailwind CSS v3 | Utility-first styling |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | InsForge (Postgres) | DB + Auth + SDK bawaan |
| **Autentikasi** | InsForge Auth | JWT, email/password, OAuth built-in |
| **AI Generate** | DeepSeek V4 Flash | Generate teks CV & surat lamaran |
| **PDF Export** | @react-pdf/renderer | Render & download PDF di sisi client |
| **State Management** | Zustand | Lightweight global state |
| **HTTP Client** | Axios | Request ke backend |

### Catatan Penting InsForge
InsForge adalah platform **agent-native cloud infrastructure** (mirip Supabase) yang menyediakan:
- **Postgres database** dengan REST/SDK endpoint otomatis per tabel
- **Auth built-in** — JWT, email/password, OAuth (Google, GitHub, dll)
- **TypeScript SDK** (`@insforge/client`) untuk query DB & auth dari frontend/backend
- **Row-Level Security (RLS)** — keamanan data per-user langsung di level DB
- **Model Gateway** — opsional, bisa dipakai untuk routing AI request
- Tidak perlu setup auth dari nol; InsForge menangani sesi & token

---

## 5. Arsitektur Sistem

### Diagram Arsitektur

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (React.js + Vite)                     │
│                                                                  │
│  ┌────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │ Auth Pages │  │   CV Builder    │  │   Letter Builder    │  │
│  │ Login/Reg  │  │  Multi-step     │  │   AI Generate +     │  │
│  │            │  │  + react-pdf    │  │   Edit Manual       │  │
│  └────────────┘  │  Preview        │  └─────────────────────┘  │
│                  └─────────────────┘                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               Dashboard (list CV & Surat)               │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬───────────────────────────────────────┘
                           │ REST API (JSON) via Axios
                           │ + @insforge/client SDK (Auth & DB)
┌──────────────────────────▼───────────────────────────────────────┐
│                   SERVER (Node.js + Express.js)                   │
│                                                                  │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐  │
│  │  Auth       │  │  CV & Letter     │  │  AI Service       │  │
│  │  Middleware │  │  Controllers     │  │  (DeepSeek V4)    │  │
│  │  (InsForge  │  │                  │  │                   │  │
│  │   JWT)      │  └──────────────────┘  └───────────────────┘  │
│  └─────────────┘                                                 │
└──────────────────────────┬───────────────────────────────────────┘
                           │ @insforge/client (TypeScript SDK)
                           │ + PostgREST auto endpoints
┌──────────────────────────▼───────────────────────────────────────┐
│                  INSFORGE PLATFORM                                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Service │  │  Postgres DB │  │  Row-Level Security  │  │
│  │ (JWT + OAuth)│  │  (tables +   │  │  (per-user data      │  │
│  │              │  │   REST API)  │  │   isolation)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  DeepSeek   │
                    │  V4 Flash   │
                    │  API        │
                    └─────────────┘
```

### Pola Komunikasi
- **Frontend → InsForge Auth** langsung via `@insforge/client` (sign-up, login, session)
- **Frontend → Backend** via REST API (bawa JWT InsForge di header `Authorization`)
- **Backend** memverifikasi JWT InsForge lalu operasi DB via InsForge SDK
- **Backend → DeepSeek** untuk generate teks surat/ringkasan
- **PDF export** sepenuhnya di client via `@react-pdf/renderer` (tidak perlu server)

---

## 6. Struktur Folder

### Frontend
```
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Stepper.jsx
│   │   ├── cv/
│   │   │   ├── CVForm/
│   │   │   │   ├── StepPersonal.jsx
│   │   │   │   ├── StepSummary.jsx
│   │   │   │   ├── StepExperience.jsx
│   │   │   │   ├── StepEducation.jsx
│   │   │   │   ├── StepSkills.jsx
│   │   │   │   └── StepProjects.jsx
│   │   │   ├── CVPreview.jsx         # @react-pdf/renderer preview
│   │   │   ├── templates/
│   │   │   │   ├── ATSCleanTemplate.jsx
│   │   │   │   └── ATSModernTemplate.jsx
│   │   │   └── TemplatePicker.jsx
│   │   └── letter/
│   │       ├── LetterForm.jsx
│   │       └── LetterEditor.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── CVBuilder/
│   │   │   └── CVBuilderPage.jsx
│   │   └── LetterBuilder/
│   │       └── LetterBuilderPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js         # wrap InsForge auth SDK
│   │   ├── useCV.js
│   │   └── useLetter.js
│   ├── services/
│   │   ├── insforge.js        # init @insforge/client
│   │   ├── api.js             # axios instance ke backend
│   │   └── pdfExport.js       # react-pdf helpers
│   ├── store/
│   │   ├── authStore.js       # Zustand
│   │   └── cvStore.js
│   └── utils/
│       └── atsRules.js
├── tailwind.config.js
└── vite.config.js
```

### Backend
```
backend/
├── src/
│   ├── config/
│   │   ├── insforge.js        # @insforge/client init (server-side)
│   │   └── env.js
│   ├── controllers/
│   │   ├── cvController.js
│   │   ├── letterController.js
│   │   └── templateController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # verifikasi JWT InsForge
│   │   └── validate.js
│   ├── routes/
│   │   ├── cvRoutes.js
│   │   ├── letterRoutes.js
│   │   └── templateRoutes.js
│   ├── services/
│   │   └── aiService.js       # DeepSeek V4 Flash integration
│   └── app.js
├── .env
└── package.json
```

---

## 7. Skema Database (InsForge / Postgres)

InsForge menyediakan Postgres dengan **REST API otomatis** per tabel dan **RLS** untuk isolasi data per user.

### Tabel: `cvs`
```sql
CREATE TABLE cvs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       VARCHAR(150) NOT NULL,
  template_id VARCHAR(50) NOT NULL DEFAULT 'ats-clean-v1',
  data        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat per user
CREATE INDEX cvs_user_id_idx ON cvs(user_id);
CREATE INDEX cvs_created_at_idx ON cvs(created_at DESC);

-- RLS: user hanya bisa lihat/edit CV miliknya sendiri
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own CVs"
  ON cvs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Tabel: `cover_letters`
```sql
CREATE TABLE cover_letters (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_id       UUID REFERENCES cvs(id) ON DELETE SET NULL,
  position    VARCHAR(200) NOT NULL,
  company     VARCHAR(200) NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cover_letters_user_id_idx ON cover_letters(user_id);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own cover letters"
  ON cover_letters FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Tabel: `templates` (seed data)
```sql
CREATE TABLE templates (
  id           VARCHAR(50) PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data template
INSERT INTO templates VALUES
  ('ats-clean-v1', 'ATS Clean', 'Format minimalis satu kolom, 100% ATS-friendly', true, NOW()),
  ('ats-modern-v1', 'ATS Modern', 'Modern dengan aksen warna tipis, tetap ATS-safe', true, NOW());
```

### Struktur JSONB untuk field `data` di tabel `cvs`
```json
{
  "personal": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "city": "string",
    "linkedin": "string (optional)",
    "github": "string (optional)",
    "portfolio": "string (optional)"
  },
  "summary": "string",
  "experiences": [
    {
      "company": "string",
      "position": "string",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM | null",
      "is_current": "boolean",
      "description": ["bullet point string", "..."]
    }
  ],
  "educations": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "start_year": "YYYY",
      "end_year": "YYYY | null",
      "gpa": "string (optional)"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "tech_stack": ["string"],
      "url": "string (optional)"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM"
    }
  ]
}
```

---

## 8. API Endpoint (Backend Node.js)

Backend berfungsi sebagai **business logic layer** dan proxy ke InsForge DB + DeepSeek AI. Auth dihandle InsForge, backend hanya verifikasi token.

### Middleware Auth
```
Authorization: Bearer <insforge_jwt_token>
```
Backend memverifikasi token via InsForge SDK (`insforge.auth.getUser(token)`) sebelum setiap request.

### CV Endpoints
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/cv` | ✅ | List semua CV milik user (pagination) |
| POST | `/api/cv` | ✅ | Buat CV baru |
| GET | `/api/cv/:id` | ✅ | Get detail CV (validasi ownership) |
| PUT | `/api/cv/:id` | ✅ | Update CV |
| DELETE | `/api/cv/:id` | ✅ | Hapus CV |
| POST | `/api/cv/:id/duplicate` | ✅ | Duplikat CV dengan title baru |
| POST | `/api/cv/generate-summary` | ✅ | AI generate ringkasan profil |

### Cover Letter Endpoints
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/letter` | ✅ | List semua surat milik user |
| POST | `/api/letter` | ✅ | Buat surat baru (simpan draft) |
| GET | `/api/letter/:id` | ✅ | Get detail surat |
| PUT | `/api/letter/:id` | ✅ | Update konten surat |
| DELETE | `/api/letter/:id` | ✅ | Hapus surat |
| POST | `/api/letter/generate` | ✅ | AI generate surat lamaran |

### Template Endpoints
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/templates` | ❌ | List template aktif (publik) |

### AI Generate — Request/Response

**POST `/api/letter/generate`**
```json
// Request
{
  "cv_id": "uuid (optional, referensi data pengguna)",
  "position": "Backend Developer",
  "company": "PT Teknologi Nusantara",
  "company_desc": "Perusahaan fintech yang fokus pada payment gateway",
  "highlights": ["3 tahun pengalaman Node.js", "pernah bangun sistem high-traffic"]
}

// Response
{
  "success": true,
  "data": {
    "content": "Dengan hormat,\n\nSaya menulis surat ini untuk melamar posisi..."
  }
}
```

**POST `/api/cv/generate-summary`**
```json
// Request
{
  "experiences": [...],
  "skills": { "technical": [...], "soft": [...] },
  "target_position": "Full Stack Developer"
}

// Response
{
  "success": true,
  "data": {
    "summary": "Full Stack Developer dengan pengalaman 3 tahun..."
  }
}
```

---

## 9. Integrasi InsForge

### Setup Client (Frontend & Backend)
```javascript
// src/services/insforge.js (frontend)
import { createClient } from '@insforge/client'

export const insforge = createClient(
  import.meta.env.VITE_INSFORGE_URL,
  import.meta.env.VITE_INSFORGE_ANON_KEY
)

// src/config/insforge.js (backend)
import { createClient } from '@insforge/client'

export const insforge = createClient(
  process.env.INSFORGE_URL,
  process.env.INSFORGE_SERVICE_KEY  // service key untuk bypass RLS di backend
)
```

### Auth Flow (Frontend)
```javascript
// Register
const { data, error } = await insforge.auth.signUp({
  email: 'user@email.com',
  password: 'password123'
})

// Login
const { data, error } = await insforge.auth.signInWithPassword({
  email: 'user@email.com',
  password: 'password123'
})

// Get session (untuk attach ke API request)
const { data: { session } } = await insforge.auth.getSession()
// session.access_token → kirim ke backend
```

### DB Query via SDK
```javascript
// Buat CV baru (dari backend, pakai service key)
const { data, error } = await insforge
  .from('cvs')
  .insert({
    user_id: userId,
    title: 'CV Software Engineer 2026',
    template_id: 'ats-clean-v1',
    data: cvData
  })
  .select()
  .single()

// List CV milik user
const { data, error } = await insforge
  .from('cvs')
  .select('id, title, template_id, created_at, updated_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(0, 9)  // pagination 10 per halaman
```

### Verifikasi Token di Backend Middleware
```javascript
// middleware/authMiddleware.js
import { insforge } from '../config/insforge.js'

export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })

  const { data: { user }, error } = await insforge.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  req.user = user
  next()
}
```

---

## 10. Integrasi DeepSeek V4 Flash

### Konfigurasi AI Service
```javascript
// services/aiService.js
import OpenAI from 'openai'  // DeepSeek kompatibel dengan OpenAI SDK

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
})

export async function generateCoverLetter({ position, company, companyDesc, highlights, cvData }) {
  const prompt = buildCoverLetterPrompt({ position, company, companyDesc, highlights, cvData })

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',  // DeepSeek V4 Flash
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten profesional yang membantu membuat surat lamaran kerja dalam Bahasa Indonesia.
                  Buat surat yang formal, spesifik, dan meyakinkan. Maksimal 4 paragraf.
                  Jangan gunakan template generik. Sesuaikan dengan posisi dan perusahaan.`
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800,
    temperature: 0.7
  })

  return response.choices[0].message.content
}

export async function generateProfileSummary({ experiences, skills, targetPosition }) {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: `Buat ringkasan profil CV dalam Bahasa Indonesia. 
                  Maksimal 3 kalimat. Padat, profesional, dan ATS-friendly.
                  Hanya berisi teks ringkasan, tanpa label atau heading.`
      },
      {
        role: 'user',
        content: `Pengalaman: ${JSON.stringify(experiences)}
                  Keahlian: ${JSON.stringify(skills)}
                  Target posisi: ${targetPosition}`
      }
    ],
    max_tokens: 200,
    temperature: 0.6
  })

  return response.choices[0].message.content
}
```

---

## 11. PDF Export dengan @react-pdf/renderer

### Strategi Export
PDF di-render **sepenuhnya di sisi client (browser)** menggunakan `@react-pdf/renderer`. Tidak butuh server untuk export, mengurangi beban backend dan lebih cepat bagi pengguna.

### Contoh Template ATS Clean
```jsx
// components/cv/templates/ATSCleanTemplate.jsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: '#1a1a1a'
  },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  contact: { fontSize: 9, color: '#444', marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 2,
    marginTop: 12,
    marginBottom: 6
  },
  bullet: { marginLeft: 10, marginBottom: 2 }
})

export function ATSCleanTemplate({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{data.personal.name}</Text>
        <Text style={styles.contact}>
          {data.personal.email} | {data.personal.phone} | {data.personal.city}
          {data.personal.linkedin ? ` | ${data.personal.linkedin}` : ''}
        </Text>

        {/* Ringkasan */}
        {data.summary && (
          <View>
            <Text style={styles.sectionTitle}>Ringkasan Profil</Text>
            <Text>{data.summary}</Text>
          </View>
        )}

        {/* Pengalaman */}
        <Text style={styles.sectionTitle}>Pengalaman Kerja</Text>
        {data.experiences.map((exp, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{exp.position} — {exp.company}</Text>
            <Text style={{ color: '#555', fontSize: 9 }}>
              {exp.start_date} – {exp.is_current ? 'Sekarang' : exp.end_date}
            </Text>
            {exp.description.map((point, j) => (
              <Text key={j} style={styles.bullet}>• {point}</Text>
            ))}
          </View>
        ))}

        {/* Pendidikan, Keahlian, dst... */}
      </Page>
    </Document>
  )
}
```

### Tombol Download
```jsx
import { PDFDownloadLink } from '@react-pdf/renderer'

<PDFDownloadLink
  document={<ATSCleanTemplate data={cvData} />}
  fileName={`${cvData.personal.name.replace(/ /g, '-')}-CV.pdf`}
>
  {({ loading }) => loading ? 'Menyiapkan PDF...' : 'Download PDF'}
</PDFDownloadLink>
```

---

## 12. Fitur Utama (Feature Scope)

### MVP — Fase 1

#### 12.1 Autentikasi (via InsForge Auth)
- Register dengan email/password
- Login, logout, session persistence
- Proteksi halaman (route guard berbasis token InsForge)

#### 12.2 CV Builder Multi-Step
Form 6 langkah dengan progress stepper:

| Step | Konten |
|------|--------|
| 1 | Informasi Dasar (nama, email, telepon, kota, LinkedIn, GitHub) |
| 2 | Ringkasan Profil (manual atau auto-generate via DeepSeek) |
| 3 | Pengalaman Kerja (multiple entry, bullet points) |
| 4 | Pendidikan (multiple entry) |
| 5 | Keahlian & Proyek |
| 6 | Pilih Template + Preview Final |

Fitur tambahan:
- Preview CV real-time di panel kanan (split-view desktop, tab switch mobile)
- Simpan draft otomatis ke InsForge DB setiap pindah step
- Download PDF via `@react-pdf/renderer`

#### 12.3 Surat Lamaran Generator
- Input: posisi, perusahaan, deskripsi perusahaan, highlights
- Pilihan referensi CV yang sudah dibuat
- Generate via DeepSeek V4 Flash
- Area edit manual hasil generate (textarea)
- Download PDF surat

#### 12.4 Dashboard
- Grid dokumen: CV & Surat Lamaran
- Info: judul, tanggal buat, tanggal update
- Aksi: Edit, Duplikat, Download, Hapus
- Empty state dengan CTA jelas

---

## 13. Antarmuka (UI/UX Requirements)

### 13.1 Keputusan Desain

| Aspek | Keputusan | Alasan |
|-------|-----------|--------|
| **Gaya** | Clean & Profesional | Target pengguna adalah pencari kerja — kepercayaan & kesan serius lebih penting dari visual yang trendi |
| **Color Mode** | Light & Dark (keduanya) | Preferensi pengguna berbeda; dark mode juga mengurangi kelelahan mata saat pengisian form panjang |
| **Cakupan** | Semua halaman utama | Landing, Auth, Dashboard, CV Builder, Letter Builder |
| **Layout** | Mobile-first, responsive | Banyak pengguna mulai dari HP sebelum pindah ke laptop |

### 13.2 Design Tokens

#### Palet Warna
```
Primary     : #2563EB  (Biru — aksi utama, CTA, link aktif)
Primary Dark : #1D4ED8  (hover state)
Surface     : #FFFFFF / #0F172A  (light / dark background)
Surface-2   : #F8FAFC / #1E293B  (card, panel background)
Border      : #E2E8F0 / #334155  (light / dark)
Text Primary : #0F172A / #F1F5F9
Text Muted  : #64748B / #94A3B8
Success     : #16A34A
Danger      : #DC2626
Warning     : #D97706
```

#### Tipografi
```
Font Family  : Inter (sans-serif) — via Google Fonts
Heading 1    : 32px / weight 600 / line-height 1.2
Heading 2    : 24px / weight 600
Heading 3    : 18px / weight 500
Body         : 15px / weight 400 / line-height 1.6
Small / Label: 13px / weight 400
Code         : JetBrains Mono (khusus snippet)
```

#### Spacing & Radius
```
Border Radius: 8px (komponen kecil), 12px (card), 16px (modal)
Spacing unit : 4px base — gunakan kelipatan 4 (8, 12, 16, 24, 32, 48)
Container max: 1280px (desktop), full-width dengan padding 16px (mobile)
```

#### Shadow
```
Card shadow  : 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)
Modal shadow : 0 20px 60px rgba(0,0,0,0.15)
(Tidak ada heavy drop shadow — kesan flat & clean)
```

### 13.3 Halaman yang Dibutuhkan

| Halaman | Route | Keterangan |
|---------|-------|------------|
| Landing Page | `/` | Hero, fitur, contoh CV, CTA |
| Login | `/login` | Form login |
| Register | `/register` | Form register |
| Dashboard | `/dashboard` | List dokumen CV & Surat |
| CV Builder | `/cv/new` & `/cv/:id/edit` | Multi-step builder + preview |
| Letter Builder | `/letter/new` & `/letter/:id/edit` | Generator surat + editor |
| Template Picker | (modal di dalam CV Builder) | Pilih template ATS |

### 13.4 Spesifikasi Per Halaman

#### Landing Page (`/`)
```
Layout   : Full-width, satu kolom
Sections :
  1. Navbar          — Logo kiri, nav tengah, CTA kanan (Login / Mulai Gratis)
  2. Hero            — Headline besar, subtext, 2 CTA button, mockup CV preview
  3. Fitur Unggulan  — 3 kartu horizontal: ATS-Ready / AI Generate / Instant PDF
  4. Cara Kerja      — 3 langkah bernomor (Isi Form → Generate → Download)
  5. CTA Banner      — Background biru, teks ajakan, tombol putih
  6. Footer          — Logo, link navigasi, copyright

Dark mode: Background gelap (#0F172A), hero tetap terbaca
```

#### Login & Register (`/login`, `/register`)
```
Layout   : Split — ilustrasi/branding kiri (40%), form kanan (60%)
           Mobile: form full-width, ilustrasi disembunyikan

Login form fields:
  - Email (input text)
  - Password (input password + toggle show/hide)
  - Tombol "Masuk" (full width, primary)
  - Link "Daftar sekarang" di bawah

Register form fields:
  - Nama Lengkap
  - Email
  - Password
  - Konfirmasi Password
  - Tombol "Buat Akun" (full width, primary)
  - Link "Sudah punya akun? Masuk"

Validasi:
  - Error message inline per field
  - Tombol disabled saat loading
  - Loading spinner di dalam tombol
```

#### Dashboard (`/dashboard`)
```
Layout   : Sidebar kiri (240px) + konten kanan
           Mobile: bottom navigation

Sidebar items: Dashboard, CV Saya, Surat Lamaran, Pengaturan, Logout

Konten:
  - Header: "Dokumen Saya" + tombol "+ Buat CV" & "+ Buat Surat"
  - Tab filter: Semua | CV | Surat Lamaran
  - Grid kartu dokumen (3 kolom desktop, 1 kolom mobile):
      Setiap kartu berisi:
        - Ikon tipe dokumen
        - Judul dokumen
        - Tanggal dibuat / diperbarui
        - Badge template (khusus CV)
        - Menu aksi: Edit | Download | Duplikat | Hapus
  - Empty state: ilustrasi + teks ajakan + tombol CTA

Pagination: Load more / infinite scroll
```

#### CV Builder (`/cv/new`, `/cv/:id/edit`)
```
Layout   : Split view
  - Kiri  : Panel form (50%) dengan stepper di atas
  - Kanan : Preview CV A4 real-time via @react-pdf/renderer (50%)
  - Mobile: Tab toggle antara "Form" dan "Preview"

Stepper (6 langkah):
  Step 1 — Informasi Dasar
    Fields: Nama, Email, Telepon, Kota, LinkedIn (opt), GitHub (opt)

  Step 2 — Ringkasan Profil
    Fields: Textarea ringkasan
    Extras: Tombol "Generate dengan AI" → loading → hasilkan teks DeepSeek

  Step 3 — Pengalaman Kerja
    Fields per entry: Perusahaan, Posisi, Periode, Deskripsi (bullet)
    Extras: Tombol "+ Tambah Pengalaman", drag reorder

  Step 4 — Pendidikan
    Fields per entry: Institusi, Jurusan, Gelar, Tahun, IPK (opt)
    Extras: Tombol "+ Tambah Pendidikan"

  Step 5 — Keahlian & Proyek
    Keahlian: Tag input (technical & soft skills)
    Proyek: Nama, Deskripsi, Tech stack, URL (opt)

  Step 6 — Pilih Template & Finalisasi
    Template picker: kartu visual 2 pilihan (ATS Clean / ATS Modern)
    Aksi: "Simpan Draft" | "Download PDF"

Navigasi stepper: tombol Sebelumnya / Selanjutnya + klik langsung ke step
Auto-save: setiap pindah step, data tersimpan ke InsForge
```

#### Letter Builder (`/letter/new`, `/letter/:id/edit`)
```
Layout   : Dua panel vertikal
  - Atas  : Form input (referensi CV, posisi, perusahaan, highlights)
  - Bawah : Area hasil + editor teks

Form fields:
  - Pilih CV referensi (dropdown, opsional)
  - Posisi yang dilamar (input text)
  - Nama perusahaan (input text)
  - Deskripsi singkat perusahaan (textarea, opsional)
  - Hal yang ingin ditonjolkan (tag input / textarea)

Aksi:
  - Tombol "Generate Surat" → loading state DeepSeek → muncul hasil
  - Setelah generate: textarea bisa diedit manual
  - Tombol "Download PDF" (aktif setelah ada konten)
  - Tombol "Simpan"

Loading state: skeleton placeholder + pesan "DeepSeek sedang menulis..."
```

### 13.5 Komponen UI Shared

| Komponen | Deskripsi |
|----------|-----------|
| `Navbar` | Logo + nav link + auth button; sticky di atas |
| `Sidebar` | Navigasi dashboard; collapse di mobile |
| `Stepper` | Progress bar langkah dengan label & status |
| `FormField` | Label + input + error message — konsisten semua form |
| `DocumentCard` | Kartu dokumen di dashboard dengan aksi |
| `CVPreview` | Wrapper react-pdf preview skala A4 |
| `AIGenerateBtn` | Tombol dengan loading state & animasi |
| `Toast` | Notifikasi sukses/error, auto-dismiss 3 detik |
| `Modal` | Konfirmasi hapus, template picker |
| `EmptyState` | Ilustrasi + heading + subtext + CTA button |
| `TagInput` | Input untuk skills / highlights berupa tag |
| `DarkModeToggle` | Switch light/dark di navbar & sidebar |

### 13.6 Dark Mode Implementation

Dark mode menggunakan Tailwind CSS class strategy (`dark:`):

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // toggle via class 'dark' pada <html>
  ...
}
```

```javascript
// Persistent preference via localStorage
const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.classList.toggle('dark', savedTheme === 'dark')
```

Setiap komponen wajib mendefinisikan pasangan kelas light & dark:
```jsx
// Contoh card
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ...">
```

### 13.7 Responsivitas

| Breakpoint | Lebar | Perubahan Layout |
|-----------|-------|-----------------|
| Mobile | < 768px | Sidebar → bottom nav, split view → tab toggle, grid 1 kolom |
| Tablet | 768–1024px | Sidebar collapse, grid 2 kolom |
| Desktop | > 1024px | Layout penuh, split view aktif, grid 3 kolom |

---

## 14. Rules ATS yang Harus Dipenuhi

Semua template CV yang dihasilkan wajib memenuhi:

- [ ] Font standar: Helvetica, Arial, atau Times New Roman
- [ ] Layout satu kolom, tanpa tabel atau kolom ganda
- [ ] Tidak ada gambar, foto, grafik, atau ikon dekoratif
- [ ] Urutan section: Ringkasan → Pengalaman → Pendidikan → Keahlian
- [ ] Format tanggal konsisten (contoh: Jan 2023 – Mar 2024)
- [ ] Heading section jelas dan konsisten (uppercase atau bold)
- [ ] Bullet point menggunakan karakter `•` standar
- [ ] Margin minimum 1 inch / 2.54 cm di semua sisi
- [ ] Tidak ada header/footer dokumen yang mengandung info penting
- [ ] Nama file PDF tanpa spasi (`Nama-Lengkap-CV.pdf`)

---

## 15. Non-Functional Requirements

| Kategori | Target |
|----------|--------|
| **Performa** | FCP < 2.5 detik, AI generate < 8 detik, PDF download < 3 detik |
| **Keamanan** | HTTPS wajib, JWT InsForge, RLS di level DB, tidak log data CV di server |
| **Skalabilitas** | Backend stateless, InsForge handles DB scaling |
| **Browser** | Chrome, Firefox, Safari, Edge (2 versi terakhir) |
| **Responsivitas** | Mobile 360px+, Tablet 768px+, Desktop 1280px+ |
| **Aksesibilitas** | Label form lengkap, keyboard navigable, kontras WCAG AA |

---

## 16. Rencana Pengembangan (Roadmap)

### Fase 1 — MVP (Estimasi: 6–8 Minggu)
- [ ] Setup project: Vite + React, Node.js + Express, InsForge project
- [ ] Autentikasi lengkap (InsForge Auth: register, login, logout)
- [ ] CV Builder multi-step (6 step) dengan 1 template ATS
- [ ] Preview CV real-time via `@react-pdf/renderer`
- [ ] Download CV sebagai PDF
- [ ] Simpan & load CV dari InsForge DB
- [ ] Dashboard dasar (list, hapus CV)

### Fase 2 — Iterasi 1 (Estimasi: +3 Minggu)
- [ ] AI generate ringkasan profil (DeepSeek)
- [ ] Surat Lamaran Generator (form + DeepSeek generate)
- [ ] Template kedua (ATS Modern)
- [ ] Duplikat dokumen
- [ ] Dashboard surat lamaran

### Fase 3 — Iterasi 2 (Estimasi: +3 Minggu)
- [ ] Google OAuth via InsForge Auth
- [ ] Multiple bahasa (Indonesia & Inggris)
- [ ] ATS score checker sederhana (keyword matching)
- [ ] Fitur link share CV (public URL)
- [ ] Onboarding tour pengguna baru

---

## 17. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| AI DeepSeek generate teks tidak relevan | Tinggi | Prompt engineering yang ketat + opsi edit manual wajib tersedia |
| `@react-pdf/renderer` lambat di mobile | Sedang | Batasi jumlah elemen, kompres font, lazy render |
| InsForge RLS salah config → data bocor | Tinggi | Test RLS policy di staging sebelum deploy, service key hanya di backend |
| DeepSeek API down | Sedang | Error handling ramah, teks bisa diisi manual tanpa AI |
| Format PDF tidak konsisten lintas browser | Rendah | react-pdf render server-side font, tidak bergantung browser font |

---

## 18. Environment Variables

### Frontend (`.env`)
```env
VITE_INSFORGE_URL=https://<project-id>.insforge.dev
VITE_INSFORGE_ANON_KEY=anon_...
VITE_API_BASE_URL=http://localhost:5000
```

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=development

# InsForge
INSFORGE_URL=https://<project-id>.insforge.dev
INSFORGE_SERVICE_KEY=service_...   # bypass RLS, JANGAN expose ke client

# DeepSeek
DEEPSEEK_API_KEY=sk-...

# CORS
CLIENT_URL=http://localhost:3000
```

---

## 19. Definisi Done (Definition of Done)

Sebuah fitur dianggap selesai jika:
- [ ] Kode sudah di-review minimal 1 orang lain
- [ ] Berjalan di environment staging tanpa error
- [ ] Tampil responsif di mobile (360px) dan desktop (1280px)
- [ ] Tidak ada console error/warning di browser
- [ ] RLS policy InsForge sudah di-test (user A tidak bisa akses data user B)
- [ ] Loading state dan error state sudah tersedia
- [ ] Postman collection di-update untuk endpoint baru

---

*Dokumen ini merupakan panduan pengembangan. Dapat diperbarui sesuai feedback tim dan pengguna.*

**Versi:** 3.0 — Ditambahkan spesifikasi UI/UX lengkap (Section 13): design tokens, spesifikasi per halaman, komponen shared, dark mode implementation, dan breakpoint responsivitas.