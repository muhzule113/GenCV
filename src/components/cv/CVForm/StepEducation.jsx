import Input from '../../common/Input'
import Button from '../../common/Button'

export default function StepEducation({ data, onChange }) {
 const add = () => {
 onChange('educations', [...data.educations, { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '', thesis: '' }])
 }

 const update = (index, field, value) => {
 const updated = [...data.educations]
 updated[index] = { ...updated[index], [field]: value }
 onChange('educations', updated)
 }

 const remove = (index) => {
 onChange('educations', data.educations.filter((_, i) => i !== index))
 }

 return (
 <div className="space-y-5">
 <div>
 <h3 className="text-lg font-semibold text-ink mb-1">Pendidikan</h3>
 <p className="text-sm text-muted mb-4">Tambahkan riwayat pendidikan Anda.</p>
 </div>

 {data.educations.map((edu, i) => (
 <div key={i} className="card p-5 space-y-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-ink ">Pendidikan #{i + 1}</span>
 <button onClick={() => remove(i)} className="text-xs text-danger hover:underline">Hapus</button>
 </div>
 <div className="grid md:grid-cols-2 gap-4">
 <Input label="Institusi" placeholder="Universitas Indonesia" value={edu.institution} onChange={(e) => update(i, 'institution', e.target.value)} />
 <Input label="Gelar" placeholder="Sarjana" value={edu.degree} onChange={(e) => update(i, 'degree', e.target.value)} />
 <Input label="Jurusan" placeholder="Teknik Informatika" value={edu.field} onChange={(e) => update(i, 'field', e.target.value)} />
 <Input label="IPK (opsional)" placeholder="3.78" value={edu.gpa} onChange={(e) => update(i, 'gpa', e.target.value)} />
 <Input label="Tahun Mulai" placeholder="2019" value={edu.startYear} onChange={(e) => update(i, 'startYear', e.target.value)} />
 <Input label="Tahun Selesai" placeholder="2023" value={edu.endYear} onChange={(e) => update(i, 'endYear', e.target.value)} />
 </div>
 <Input label="Tugas Akhir / Skripsi (opsional)" placeholder="Judul skripsi..." value={edu.thesis} onChange={(e) => update(i, 'thesis', e.target.value)} />
 </div>
 ))}
 <Button variant="secondary" onClick={add}>+ Tambah Pendidikan</Button>
 </div>
 )
}
