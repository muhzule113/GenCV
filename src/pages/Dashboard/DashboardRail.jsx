import { useMemo } from 'react'

export default function DashboardRail({
  stats,
  templateDistribution,
  cvWordCount,
  avgAtsScore,
  onExportAll,
}) {
  const distributionEntries = useMemo(
    () => Object.entries(templateDistribution || {}),
    [templateDistribution]
  )

  return (
    <aside className="w-56 shrink-0 border-l border-border hidden xl:block p-4 space-y-5">
      {/* Header */}
      <div className="font-mono text-[11px] tracking-widest text-clip uppercase">
        ◆ ALAT UKUR
      </div>

      {/* Total word count */}
      <div>
        <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
          TOTAL KATA
        </p>
        <p className="font-mono text-display text-ink mt-1">
          {cvWordCount != null ? Number(cvWordCount).toLocaleString() : '...'}
        </p>
      </div>

      {/* Average ATS score */}
      <div>
        <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
          SKOR ATS
        </p>
        <p className="font-mono text-display text-ink mt-1">
          {avgAtsScore === null ? '...' : avgAtsScore === 0 ? '\u2014' : `${avgAtsScore}/100`}
        </p>
      </div>

      {/* Template distribution */}
      {distributionEntries.length > 0 && (
        <div>
          <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
            TEMPLATE
          </p>
          <p className="font-mono text-sm text-ink mt-1">
            {distributionEntries.map(([name, count], i) => (
              <span key={name}>
                {i > 0 && <span className="text-muted mx-1">\u00B7</span>}
                {name} {count}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Active this week */}
      <div>
        <p className="font-mono text-[11px] tracking-widest text-muted uppercase">
          MINGGU INI
        </p>
        <p className="font-mono text-display text-ink mt-1">
          {stats?.activeThisWeek ?? 0} dokumen
        </p>
      </div>

      <div className="border-t border-border" />

      {/* Export All */}
      <div>
        <p className="font-mono text-[11px] tracking-widest text-clip uppercase mb-2">
          CETAK BIRU
        </p>
        <button
          onClick={onExportAll}
          className="w-full px-3 py-2 text-xs font-mono tracking-wider uppercase border border-ink text-ink hover:bg-ink hover:text-paper transition-colors duration-150"
        >
          Export \u2192
        </button>
      </div>

    </aside>
  )
}
