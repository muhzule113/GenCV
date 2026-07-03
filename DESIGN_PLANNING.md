# Design Planning - CV Builder & Surat Lamaran

**Versi:** 1.0 | **Status:** Planning

---

## 1. Executive Summary

**Problem:** 
- Duplikasi input data antara CV Builder dan Surat Lamaran
- Tidak ada auto-save (data hilang saat refresh)
- Hanya 1 template CV tersedia
- Tidak ada fitur import data
- Semua data client-side

**Solution:**
- Shared Profile System (input 1x untuk semua dokumen)
- Auto-save dengan localStorage
- Multi-template CV (3 template)
- Import data dari JSON/LinkedIn
- Backend storage (phase 2)

---

## 2. Current State Analysis

### Arsitektur Existing

```
Frontend (React)
├─ CvBuilder.jsx (1.058 lines)
│  ├─ PersonalInfo (8 fields)
│  ├─ Summary (1 field)
│  ├─ Experience (dynamic list)
│  ├─ Education (dynamic list)
│  └─ Skills (dynamic list)
│
└─ SuratLamaranForm.jsx (324 lines)
   ├─ ApplicantData (8 fields)
   ├─ JobData (5 fields)
   ├─ Attachments (checklist)
   └─ LocationDate (2 fields)

State: React hooks (useState)
Persistence: None
```

### Duplikasi Field

| Field | CV | Surat | Status |
|-------|----|----|--------|
| Nama | ✓ | ✓ | Duplikat |
| Email | ✓ | ✓ | Duplikat |
| HP | ✓ | ✓ | Duplikat |
| Alamat | ✓ | ✓ | Duplikat |
| TTL | ✓ | ✓ | Duplikat |
| LinkedIn | ✓ | ✗ | Unique |
| Portfolio | ✓ | ✓ | Duplikat |
| Pendidikan | ✓ | ✓ | Partial |
| Pengalaman | ✓ | ✓ | Partial |

**Impact:** 8 field duplikat, user input 2x

---

## 3. Design Problems

### P1: Duplikasi Input 🔴 HIGH
- User input data sama 2x
- Waktu +5-10 menit
- Risiko inkonsistensi

### P2: No Auto-Save 🔴 HIGH
- Data hilang saat refresh
- Kehilangan 10-20 menit kerja

### P3: Template Terbatas 🟡 MEDIUM
- Hanya 1 template ATS
- Tidak cocok untuk industri kreatif

### P4: No Import 🟡 MEDIUM
- Input manual dari nol
- Onboarding lambat

### P5: No Backend 🟢 LOW
- Tidak bisa akses multi-device
- Tidak ada riwayat/backup

---

## 4. Proposed Solutions

### S1: Shared Profile System

**Concept:** Buat Profile terpusat, kedua form read dari sini

```
User Profile (Shared)
├─ Personal Info (nama, email, HP, dll)
├─ Professional Data (summary, experience, education, skills)
│
├─→ CV Builder (uses profile)
└─→ Surat Lamaran (uses profile)
```

**Benefits:**
- Input 1x, gunakan di mana saja
- Konsistensi terjamin
- Update profile = update semua

**Implementation:**
- Buat `ProfileContext` atau `useProfile` hook
- Component `ProfileForm` untuk edit
- CV & Surat read dari profile
- Allow override jika perlu

---

### S2: Auto-Save System

**Concept:** Auto-save ke localStorage setiap 1 detik

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('cv-draft', JSON.stringify(data));
  }, 1000);
  return () => clearTimeout(timer);
}, [data]);
```

**Features:**
- Auto-save dengan debounce 1s
- Indikator "Saved" / "Saving..."
- Load draft button
- Named drafts (multiple)
- Timestamp last saved

---

### S3: Multi-Template CV

**Templates:**

1. **ATS Classic** (existing)
   - Simple, text-based
   - ATS-friendly
   - Corporate/enterprise

2. **Modern Tech** (new)
   - 2-column layout
   - Skills bars
   - Color accent
   - Tech/startup

3. **Creative Professional** (new)
   - Sidebar + photo
   - Icon-based skills
   - Custom colors
   - Design/marketing

**Implementation:**
```
src/components/cv/templates/
├─ ATSTemplate.jsx (existing)
├─ ModernTechTemplate.jsx (new)
└─ CreativeTemplate.jsx (new)
```

---

### S4: Import System

**Sources:**

1. **JSON Import** (MVP)
   - Upload JSON file
   - Parse & map ke form
   - Preview before confirm

2. **LinkedIn PDF** (advanced)
   - Upload LinkedIn PDF
   - OCR + parse
   - Extract data

3. **CV Upload** (phase 2)
   - Upload PDF/DOCX
   - Parse dengan library
   - Extract structured data

---

### S5: Backend Storage (Phase 2)

**Tech:** Supabase (recommended)
- PostgreSQL
- Built-in auth
- Free tier
- TypeScript SDK

**Schema:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT, -- 'cv' or 'surat'
  title TEXT,
  data JSONB,
  created_at TIMESTAMP
);
```

---

## 5. Implementation Roadmap

### Phase 1: Core UX (Week 1-2)

**Sprint 1: Shared Profile**
- [ ] Extract shared fields ke ProfileContext
- [ ] Buat ProfileForm component
- [ ] Update CvBuilder use profile
- [ ] Update SuratLamaranForm use profile
- [ ] Test consistency

**Sprint 2: Auto-Save**
- [ ] Implement localStorage auto-save
- [ ] Add save indicator UI
- [ ] Add load draft button
- [ ] Add named drafts
- [ ] Test persistence

**Deliverables:**
- Profile system working
- Auto-save functional
- No data loss

---

### Phase 2: Templates (Week 3-4)

**Sprint 3: Multi-Template**
- [ ] Design ModernTech template
- [ ] Implement ModernTechTemplate.jsx
- [ ] Design Creative template
- [ ] Implement CreativeTemplate.jsx
- [ ] Update TemplatePicker
- [ ] Test PDF all templates

**Deliverables:**
- 3 templates available
- Template picker working
- PDF export all templates

---

### Phase 3: Import (Week 5-6)

**Sprint 4: JSON Import**
- [ ] Define JSON schema
- [ ] Implement parser
- [ ] Add import modal
- [ ] Add preview
- [ ] Test with samples

**Deliverables:**
- JSON import working

---

### Phase 4: Backend (Week 7-8)

**Sprint 5: Supabase Setup**
- [ ] Setup Supabase project
- [ ] Create schema
- [ ] Implement auth
- [ ] Add login/register UI

**Sprint 6: Cloud Sync**
- [ ] Save profile to cloud
- [ ] Save documents to cloud
- [ ] Add document history
- [ ] Test multi-device

**Deliverables:**
- Auth working
- Cloud save functional
- Document history

---

## 6. Technical Specifications

### Profile Schema

```typescript
interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  birthPlace: string;
  birthDate: string;
  linkedin?: string;
  portfolio?: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
}

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
  gpa?: number;
}

interface Skill {
  id: string;
  name: string;
  category: 'hard-skill' | 'soft-skill' | 'tool' | 'language';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
```

### Auto-Save Hook

```typescript
// hooks/useAutoSave.js
export function useAutoSave(data, key, delay = 1000) {
  const [status, setStatus] = useState('saved');
  
  useEffect(() => {
    setStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
      setStatus('saved');
    }, delay);
    return () => clearTimeout(timer);
  }, [data, key, delay]);
  
  return status; // 'saved' | 'saving' | 'unsaved'
}
```

### Template System

```typescript
// types/template.js
export const templates = [
  {
    id: 'ats-classic',
    name: 'ATS Classic',
    description: 'Simple, ATS-friendly',
    thumbnail: '/templates/ats.png',
    component: ATSTemplate,
    category: 'ats'
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    description: '2-column with skills bars',
    thumbnail: '/templates/modern.png',
    component: ModernTechTemplate,
    category: 'modern'
  },
  {
    id: 'creative',
    name: 'Creative Pro',
    description: 'Sidebar with photo',
    thumbnail: '/templates/creative.png',
    component: CreativeTemplate,
    category: 'creative'
  }
];
```

---

## 7. Success Metrics

### Phase 1
- [ ] Reduce input time 50% (profile reuse)
- [ ] Zero data loss (auto-save)
- [ ] User can resume work after refresh

### Phase 2
- [ ] 3 templates available
- [ ] Template switch < 1s
- [ ] PDF export all templates working

### Phase 3
- [ ] JSON import accuracy > 95%
- [ ] Import time < 5s
- [ ] User can import existing data

### Phase 4
- [ ] Cloud sync working
- [ ] Multi-device access
- [ ] Document history available

---

## 8. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Profile system complex | Medium | Start simple, iterate |
| Auto-save conflict | Low | Use debounce, clear UI |
| Template performance | Medium | Lazy load templates |
| Import accuracy | High | Manual review step |
| Backend cost | Low | Start with free tier |

---

## 9. Next Steps

1. **Week 1:** Start Phase 1 Sprint 1 (Profile System)
2. **Week 2:** Complete Phase 1 Sprint 2 (Auto-Save)
3. **Week 3:** Begin Phase 2 (Templates)
4. **Week 5:** Phase 3 (Import)
5. **Week 7:** Phase 4 (Backend)

---

**Document Owner:** Design Team  
**Last Updated:** 2026
