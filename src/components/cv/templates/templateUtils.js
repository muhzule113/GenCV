const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function formatDate(value) {
  if (!value || value === 'Sekarang') return value
  const m = String(value).match(/^(\d{4})-(\d{2})$/)
  if (m) {
    const monthIdx = parseInt(m[2], 10) - 1
    return `${MONTHS[monthIdx] || m[2]} ${m[1]}`
  }
  return value
}

export function formatPeriod(start, end, isCurrent) {
  const s = formatDate(start)
  const e = isCurrent ? 'Sekarang' : formatDate(end)
  return `${s} – ${e}`
}

export function getSkills(data) {
  const tech = data.skills?.technical || []
  const soft = data.skills?.soft || []
  return {
    technical: Array.isArray(tech) && tech.length > 0 && typeof tech[0] === 'string'
      ? tech.map((t) => ({ name: t, level: null }))
      : tech,
    soft: Array.isArray(soft) && soft.length > 0 && typeof soft[0] === 'string'
      ? soft
      : [],
  }
}

export function skillLevelWidth(level) {
  if (level === 'expert') return '100%'
  if (level === 'advanced') return '80%'
  if (level === 'intermediate') return '60%'
  return '40%'
}

// ── Common PDF Style Components ──────────────────────────────────────────

export const commonStyles = {
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 6,
  },
  summary: { fontSize: 10, lineHeight: 1.4, marginBottom: 2 },
  bullet: { marginLeft: 12, marginBottom: 2, lineHeight: 1.4, fontSize: 10 },
}
