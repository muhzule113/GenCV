import { useState, useRef, useCallback } from 'react'
import { createWorker } from 'tesseract.js'
import Input from '../../common/Input'
import Button from '../../common/Button'
import useCVStore from '../../../store/cvStore'
import { analyzeJobMatch as analyzeJobApi } from '../../../services/aiService'

function StatusBadge({ status }) {
 const map = {
 match: { label: 'Sesuai', cls: 'bg-green-100 text-green-800 ' },
 partial: { label: 'Sebagian', cls: 'bg-yellow-100 text-yellow-800 ' },
 mismatch: { label: 'Tidak Sesuai', cls: 'bg-red-100 text-red-800 ' },
 }
 const s = map[status] || map.mismatch
 return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
}

function AnalysisSection({ title, data }) {
 if (!data) return null
 return (
 <div className="card border border-border rounded-lg p-4 space-y-2">
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-semibold text-ink ">{title}</h4>
 <StatusBadge status={data.status} />
 </div>
 <p className="text-sm text-muted ">{data.detail}</p>
 {data.suggestion && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
 <p className="text-xs font-medium text-blue-700 mb-0.5">Saran:</p>
 <p className="text-sm text-blue-600 ">{data.suggestion}</p>
 </div>
 )}
 </div>
 )
}

export default function StepSummary({ data, onChange, onGenerate, generating }) {
 const textareaRef = useRef(null)
 const [targetPosition, setTargetPosition] = useState('')
 const [tone, setTone] = useState('profesional')
 const [language, setLanguage] = useState('id')
 const [jobDescription, setJobDescription] = useState('')
 const [jobInputMode, setJobInputMode] = useState('text')
 const [analyzing, setAnalyzing] = useState(false)
 const [analysisResult, setAnalysisResult] = useState(null)
 const [showAnalysis, setShowAnalysis] = useState(false)
 const [ocrProgress, setOcrProgress] = useState(0)
 const [ocrFileName, setOcrFileName] = useState('')

 const cvData = useCVStore((s) => s.cvData)

 const handleGenerate = async () => {
 if (!targetPosition.trim()) return
 const summary = await onGenerate({ targetPosition, tone, language })
 if (summary) {
 setTimeout(() => {
 textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
 textareaRef.current?.focus()
 }, 200)
 }
 }

 const handleOcrImage = useCallback(async (file) => {
 setOcrFileName(file.name)
 setOcrProgress(0)
 setJobInputMode('image')
 try {
 const worker = await createWorker('ind', 1, {
 logger: (m) => {
 if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100))
 },
 })
 const { data: text } = await worker.recognize(file)
 await worker.terminate()
 setJobDescription(text.text)
 setOcrProgress(100)
 } catch {
 setOcrFileName('')
 setOcrProgress(0)
 }
 }, [])

 const handleAnalyzeJob = async () => {
 if (!jobDescription.trim()) return
 setAnalyzing(true)
 setAnalysisResult(null)
 setShowAnalysis(true)
 try {
 const result = await analyzeJobApi({ cvData, jobDescription })
 setAnalysisResult(result)
 } catch {
 setAnalysisResult(null)
 } finally {
 setAnalyzing(false)
 }
 }

 const extracted = analysisResult?.extracted
 const match = analysisResult?.matchAnalysis

 return (
 <div className="space-y-5">
 <div>
 <h3 className="text-lg font-semibold text-ink mb-1">Ringkasan Profil</h3>
 <p className="text-sm text-muted ">Buat ringkasan dan analisis kecocokan dengan lowongan kerja.</p>
 </div>

 <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-sm font-semibold text-purple-800 ">Analisis Lowongan Kerja</p>
 <span className="text-[10px] text-purple-500">Bisa teks atau gambar</span>
 </div>

 <div className="flex gap-2 mb-2">
 <button
 type="button"
 onClick={() => setJobInputMode('text')}
 className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${jobInputMode === 'text' ? 'bg-purple-600 text-white' : 'bg-white text-muted border border-border '}`}
 >
 Input Teks
 </button>
 <button
 type="button"
 onClick={() => setJobInputMode('image')}
 className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${jobInputMode === 'image' ? 'bg-purple-600 text-white' : 'bg-white text-muted border border-border '}`}
 >
 Upload Gambar
 </button>
 </div>

 {jobInputMode === 'image' ? (
 <div className="space-y-2">
 <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-surface hover:border-purple-500 transition-colors">
 <div className="flex flex-col items-center gap-1">
 <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
 </svg>
 <span className="text-xs text-muted ">Upload gambar lowongan (JPG/PNG)</span>
 </div>
 <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleOcrImage(f) }} />
 </label>
 {ocrProgress > 0 && ocrProgress < 100 && (
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-muted ">
 <span>OCR: {ocrFileName}</span>
 <span>{ocrProgress}%</span>
 </div>
 <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
 <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
 </div>
 </div>
 )}
 {ocrProgress === 100 && <p className="text-xs text-success">✓ Teks berhasil diekstrak</p>}
 </div>
 ) : null}

 <div>
 <label className="block text-sm font-medium text-ink mb-1.5">
 Deskripsi Lowongan <span className="text-red-500">*</span>
 </label>
 <textarea
 placeholder="Tempel deskripsi lowongan di sini...&#10;Contoh:&#10;Posisi: Frontend Developer&#10;Kualifikasi Umum:&#10;- Pendidikan min D3/S1&#10;- Max 28 tahun&#10;Kualifikasi Khusus:&#10;- Menguasai React.js&#10;- Pengalaman 2 tahun"
 value={jobDescription}
 onChange={(e) => setJobDescription(e.target.value)}
 rows={5}
 className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors resize-y"
 />
 </div>

 <Button
 variant="outline"
 size="sm"
 onClick={handleAnalyzeJob}
 loading={analyzing}
 disabled={!jobDescription.trim() || analyzing}
 className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
 >
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 {analyzing ? 'Menganalisis dengan DeepSeek...' : 'Analisis Kecocokan dengan AI'}
 </Button>

 {showAnalysis && (
 <div className="space-y-3">
 {analyzing ? (
 <div className="py-6 text-center text-muted ">
 <svg className="animate-spin h-5 w-5 mx-auto mb-2 text-purple-500" viewBox="0 0 24 24" fill="none">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 AI sedang membandingkan profil dengan lowongan...
 </div>
 ) : analysisResult ? (
 <div className="space-y-3">
 {extracted && (
 <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
 <h4 className="text-sm font-semibold text-ink ">Informasi Lowongan</h4>
 {extracted.position && (
 <p className="text-sm"><span className="font-medium">Posisi:</span> {extracted.position}</p>
 )}
 {extracted.generalQualifications?.length > 0 && (
 <div>
 <p className="text-sm font-medium text-ink mb-1">Kualifikasi Umum:</p>
 <ul className="list-disc list-inside space-y-0.5">
 {extracted.generalQualifications.map((q, i) => <li key={i} className="text-sm text-muted ">{q}</li>)}
 </ul>
 </div>
 )}
 {extracted.specificQualifications?.length > 0 && (
 <div>
 <p className="text-sm font-medium text-ink mb-1">Kualifikasi Khusus:</p>
 <ul className="list-disc list-inside space-y-0.5">
 {extracted.specificQualifications.map((q, i) => <li key={i} className="text-sm text-muted ">{q}</li>)}
 </ul>
 </div>
 )}
 </div>
 )}

 <h4 className="text-sm font-semibold text-ink ">Hasil Analisis Kecocokan</h4>

 {match?.education && <AnalysisSection title="Pendidikan" data={match.education} />}
 {match?.experience && <AnalysisSection title="Pengalaman" data={match.experience} />}
 {match?.skills && <AnalysisSection title="Keahlian" data={match.skills} />}

 {match?.overall && (
 <div className={`rounded-lg p-4 space-y-2 border ${
 match.overall.status === 'match' ? 'bg-green-50 border-green-200 ' :
 match.overall.status === 'partial' ? 'bg-yellow-50 border-yellow-200 ' :
 'bg-red-50 border-red-200 '
 }`}>
 <div className="flex items-center justify-between">
 <h4 className="text-sm font-semibold text-ink ">Kesimpulan</h4>
 <div className="flex items-center gap-2">
 {match.overall.score != null && (
 <span className={`text-sm font-bold ${
 match.overall.score >= 75 ? 'text-green-600 ' :
 match.overall.score >= 50 ? 'text-yellow-600 ' :
 'text-red-600 '
 }`}>{match.overall.score}%</span>
 )}
 <StatusBadge status={match.overall.status} />
 </div>
 </div>
 <p className="text-sm text-muted ">{match.overall.detail}</p>
 {match.overall.suggestion && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
 <p className="text-xs font-medium text-blue-700 mb-0.5">Saran:</p>
 <p className="text-sm text-blue-600 ">{match.overall.suggestion}</p>
 </div>
 )}
 </div>
 )}
 </div>
 ) : (
 <p className="text-xs text-danger">Analisis gagal. Coba lagi.</p>
 )}
 </div>
 )}
 </div>

 <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 space-y-4">
 <p className="text-sm font-semibold text-blue-800 ">Referensi untuk AI Ringkasan</p>

 <div>
 <label className="block text-sm font-medium text-ink mb-1.5">
 Target Posisi yang Dilamar <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 placeholder="contoh: Backend Developer, Staff Admin, Data Analyst"
 value={targetPosition}
 onChange={(e) => setTargetPosition(e.target.value)}
 className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ink/30 focus:border-ink transition-colors"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-ink mb-2">
 Tone Ringkasan
 </label>
 <div className="flex flex-wrap gap-4">
 {[
 { value: 'profesional', label: 'Profesional', desc: 'formal, terstruktur, cocok untuk perusahaan korporat' },
 { value: 'percaya-diri', label: 'Percaya Diri', desc: 'tegas, menonjolkan pencapaian' },
 { value: 'adaptif', label: 'Adaptif', desc: 'fleksibel, cocok untuk multi-industri' },
 ].map((opt) => (
 <label key={opt.value} className="flex items-start gap-2 cursor-pointer group">
 <input
 type="radio"
 name="tone"
 value={opt.value}
 checked={tone === opt.value}
 onChange={(e) => setTone(e.target.value)}
 className="mt-1 accent-primary"
 />
 <div>
 <span className="text-sm font-medium text-ink group-hover:text-primary transition-colors">{opt.label}</span>
 <p className="text-xs text-muted ">{opt.desc}</p>
 </div>
 </label>
 ))}
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-ink mb-2">
 Bahasa Output
 </label>
 <div className="flex gap-6">
 {[
 { value: 'id', label: 'Bahasa Indonesia' },
 { value: 'en', label: 'English' },
 ].map((opt) => (
 <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
 <input
 type="radio"
 name="language"
 value={opt.value}
 checked={language === opt.value}
 onChange={(e) => setLanguage(e.target.value)}
 className="accent-primary"
 />
 <span className="text-sm text-ink ">{opt.label}</span>
 </label>
 ))}
 </div>
 </div>
 </div>

 <Button
 variant="outline"
 size="sm"
 onClick={handleGenerate}
 loading={generating}
 disabled={!targetPosition.trim() || generating}
 className="gap-2"
 >
 <svg className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 {generating ? 'DeepSeek sedang menyusun ringkasan...' : 'Generate dengan AI'}
 </Button>

 <div ref={textareaRef}>
 <Input
 type="textarea"
 placeholder="Full Stack Developer dengan pengalaman 3 tahun dalam pengembangan web menggunakan React.js dan Node.js..."
 value={data.summary}
 onChange={(e) => onChange('summary', e.target.value)}
 rows={5}
 />
 </div>
 </div>
 )
}
