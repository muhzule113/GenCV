import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import Modal from '../common/Modal'
import Button from '../common/Button'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useConfirmStore from '../../store/confirmStore'

const STAGES = {
 upload: 'Pilih file gambar atau foto CV lama Anda.',
 ocr: 'Membaca teks dari gambar...',
 review: 'Review teks hasil OCR. Edit jika perlu, lalu klik "Parse ke CV".',
 parsing: 'AI sedang mengekstrak data dari teks...',
 done: 'Data CV berhasil diekstrak!',
}

 export default function OCRImportModal({ open, onClose, onImport }) {
  const fetchTokenBalance = useAuthStore((s) => s.fetchTokenBalance)
  const requestConfirm = useConfirmStore((s) => s.requestConfirm)
  const [stage, setStage] = useState('upload')
 const [file, setFile] = useState(null)
 const [preview, setPreview] = useState(null)
 const [ocrText, setOcrText] = useState('')
 const [progress, setProgress] = useState(0)
 const [error, setError] = useState(null)
 const inputRef = useRef(null)

 const resetState = () => {
 setStage('upload')
 setFile(null)
 setPreview(null)
 setOcrText('')
 setProgress(0)
 setError(null)
 }

 const handleClose = () => {
 resetState()
 onClose()
 }

 const handleFile = (e) => {
 const f = e.target.files?.[0]
 if (!f) return
 const valid = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp']
 if (!valid.includes(f.type)) {
 setError('Format file harus gambar (PNG, JPG, WebP, BMP)')
 return
 }
 setError(null)
 setFile(f)
 setPreview(URL.createObjectURL(f))
 }

 const handleOCR = async () => {
 if (!file) return
 setStage('ocr')
 setProgress(0)
 setError(null)

 try {
 const worker = await createWorker('ind+eng', 1, {
 logger: (m) => {
 if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
 },
 })
 const { data } = await worker.recognize(file)
 await worker.terminate()
 setOcrText(data.text || '')
 setStage('review')
 } catch (err) {
 setError('Gagal membaca gambar: ' + (err.message || 'Unknown error'))
 setStage('upload')
 }
 }

  const handleParse = async () => {
  if (!ocrText.trim()) return
  if (!await requestConfirm('Fitur ini akan menggunakan')) return
  setStage('parsing')
 setError(null)

 try {
 const res = await api.post('/api/cv/parse-ocr', { text: ocrText })
 setStage('done')
 // small delay so user sees "done" state
  setTimeout(() => {
  onImport(res.data.data)
  fetchTokenBalance()
  handleClose()
  }, 600)
 } catch (err) {
 setError(err.response?.data?.error || 'Gagal mem-parse teks CV')
 setStage('review')
 }
 }

 return (
 <Modal open={open} onClose={handleClose} title="Import CV dari Gambar" size="lg">
 <div className="space-y-4">
 <p className="text-sm text-muted ">{STAGES[stage]}</p>

 {error && (
 <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
 {error}
 </div>
 )}

 {stage === 'upload' && (
 <>
 <div
 onClick={() => inputRef.current?.click()}
 className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-ink hover:bg-ink/5 transition-colors"
 >
 {preview ? (
 <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
 ) : (
 <>
 <svg className="w-12 h-12 mx-auto text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 <p className="text-sm text-muted ">
 Klik atau seret gambar CV ke sini
 </p>
 <p className="text-xs text-muted/70 mt-1">PNG, JPG, WebP, BMP</p>
 </>
 )}
 <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
 </div>
 {file && (
 <div className="flex justify-end">
 <Button onClick={handleOCR}>Mulai Scan OCR</Button>
 </div>
 )}
 </>
 )}

 {stage === 'ocr' && (
 <div className="space-y-3">
 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
 <div className="h-full bg-ink rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
 </div>
 <p className="text-center text-sm text-muted ">{progress}%</p>
 </div>
 )}

 {stage === 'review' && (
 <>
 <textarea
 value={ocrText}
 onChange={(e) => setOcrText(e.target.value)}
 rows={12}
 className="w-full px-4 py-3 bg-surface border border-border text-sm text-ink font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ink/30"
 placeholder="Teks hasil OCR akan muncul di sini..."
 />
 <div className="flex justify-between">
 <Button variant="ghost" onClick={resetState}>Ulang</Button>
 <Button onClick={handleParse} disabled={!ocrText.trim()}>Parse ke CV</Button>
 </div>
 </>
 )}

 {stage === 'parsing' && (
 <div className="flex items-center justify-center gap-3 py-8">
 <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
 <span className="text-sm text-muted ">AI sedang memproses...</span>
 </div>
 )}

 {stage === 'done' && (
 <div className="flex items-center justify-center gap-2 py-8 text-emerald-500">
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 <span className="font-medium">Berhasil!</span>
 </div>
 )}
 </div>
 </Modal>
 )
}
