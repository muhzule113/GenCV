const attachmentLabels = {
  cv: 'Curriculum Vitae (CV)',
  foto: 'Pas Foto 3x4',
  ktp: 'Fotokopi KTP',
  ijazah: 'Fotokopi Ijazah',
  transkrip: 'Fotokopi Transkrip Nilai',
  sertifikat: 'Sertifikat Pendukung',
}

const defaultAttachmentKeys = ['cv', 'foto', 'ktp', 'ijazah', 'transkrip']

function buildAttachmentList(data) {
  const raw = data.attachments
  let keys = defaultAttachmentKeys
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string' && raw[0].length <= 16 && !raw[0].includes(' ')) {
    keys = raw
  } else if (Array.isArray(raw) && raw.length > 0) {
    return raw
  }
  return keys.map((k) => attachmentLabels[k] || k)
}

function formatBirthPlaceDate(p) {
  if (!p) return ''
  const place = p.birthPlace || ''
  const date = p.birthDate || ''
  if (place && date) return `${place}, ${date}`
  return place || date
}

export default function CoverLetterHTML({ data }) {
  const p = data.personal || {}
  const ttl = formatBirthPlaceDate(p)
  const attachments = buildAttachmentList(data)
  const position = (data.position || '').toUpperCase()
  const paragraphs = (data.content || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div className="letter-page">
      <div className="letter-city-date">
        {data.city || 'Barru'}, {data.date || '12 Juni 2026'}
      </div>

      <div className="letter-recipient">
        <p>Kepada Yth.</p>
        <p>{data.recipientTitle || 'HRD'}</p>
        <p>Di {data.company || '[NAMA PERUSAHAAN]'}</p>
      </div>

      <p className="letter-greeting">Dengan hormat,</p>

      <p className="letter-intro">Saya yang bertanda tangan di bawah ini :</p>

      <div className="letter-identity">
        {p.name && (
          <div className="letter-row">
            <span className="letter-label">Nama</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">{p.name}</span>
          </div>
        )}
        {ttl && (
          <div className="letter-row">
            <span className="letter-label">Tempat, Tgl Lahir</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">{ttl}</span>
          </div>
        )}
        {p.gender && (
          <div className="letter-row">
            <span className="letter-label">Jenis Kelamin</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">{p.gender}</span>
          </div>
        )}
        {p.lastEducation && (
          <div className="letter-row">
            <span className="letter-label">Pendidikan</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">{p.lastEducation}</span>
          </div>
        )}
        {p.address && (
          <div className="letter-row">
            <span className="letter-label">Alamat</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">{p.address}</span>
          </div>
        )}
        {p.phone && (
          <div className="letter-row">
            <span className="letter-label">Nomor HP</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">{p.phone}</span>
          </div>
        )}
        {p.email && (
          <div className="letter-row">
            <span className="letter-label">E-mail</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">
              <a href={`mailto:${p.email}`} className="letter-link">{p.email}</a>
            </span>
          </div>
        )}
        {p.portfolio && (
          <div className="letter-row">
            <span className="letter-label">Portofolio</span>
            <span className="letter-sep">:</span>
            <span className="letter-value">
              <a
                href={/^https?:\/\//i.test(p.portfolio) ? p.portfolio : `https://${p.portfolio}`}
                target="_blank"
                rel="noreferrer"
                className="letter-link"
              >
                {p.portfolio}
              </a>
            </span>
          </div>
        )}
      </div>

      <p className="letter-body">
        Dengan ini mengajukan lamaran sebagai <span className="letter-position">{position || '[POSISI]'}</span>, bersama
        ini saya lampirkan dokumen persyaratan sebagai berikut:
      </p>

      <ol className="letter-attachments">
        {attachments.map((label, i) => (
          <li key={i}>{label}</li>
        ))}
      </ol>

      {paragraphs.length > 0 && (
        <div className="letter-paragraphs">
          {paragraphs.map((para, i) => (
            <p key={i} className="letter-para">{para}</p>
          ))}
        </div>
      )}

      <div className="letter-signature">
        <p>Hormat saya,</p>
        <p className="letter-sig-name">( {p.name || '[Nama Lengkap]'} )</p>
      </div>
    </div>
  )
}
