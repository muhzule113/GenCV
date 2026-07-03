import { dummyTemplates } from '../../data/dummyData'

const thumbnailStyles = {
  'ats-clean-v1': { bg: 'bg-slate-50', bar: 'bg-slate-300', accent: 'bg-slate-200' },
  'ats-modern-v1': { bg: 'bg-blue-50', bar: 'bg-blue-500', accent: 'bg-blue-200' },
  'modern-tech-v1': { bg: 'bg-slate-800', bar: 'bg-blue-500', accent: 'bg-slate-600' },
  'creative-v1': { bg: 'bg-purple-950', bar: 'bg-violet-400', accent: 'bg-violet-800' },
}

  function ThumbnailPreview({ id }) {
    const css = thumbnailStyles[id] || thumbnailStyles['ats-clean-v1']
    return (
      <div className={`w-full aspect-[1.414/1] mb-3 flex items-center justify-center text-xs overflow-hidden ${css.bg}`}>
      {id === 'modern-tech-v1' ? (
        <div className="flex w-full h-full p-2 gap-2">
          <div className="w-[30%] h-full flex flex-col gap-1.5">
            <div className="h-2.5 w-3/4 rounded bg-white/20" />
            <div className="h-1.5 w-1/2 rounded bg-white/10 mb-2" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-3/4 rounded bg-white/10 mb-2" />
            <div className="h-0.5 w-full rounded bg-blue-500/60 mb-0.5" />
            <div className="h-0.5 w-4/5 rounded bg-blue-500/40 mb-0.5" />
            <div className="h-0.5 w-3/5 rounded bg-blue-500/20" />
          </div>
          <div className="flex-1 h-full flex flex-col gap-1.5 pt-1">
            <div className="h-2 w-2/3 rounded bg-blue-500 mb-1" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-3/4 rounded bg-white/10 mb-1" />
            <div className="h-2 w-1/2 rounded bg-white/20 mb-1" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-5/6 rounded bg-white/10" />
          </div>
        </div>
      ) : id === 'creative-v1' ? (
        <div className="flex w-full h-full p-2 gap-2">
          <div className="w-[28%] h-full flex flex-col items-center gap-1.5 pt-1">
            <div className="w-6 h-6 rounded-full bg-violet-500" />
            <div className="h-2 w-3/4 rounded bg-white/20" />
            <div className="h-1 w-1/2 rounded bg-white/10 mb-2" />
            <div className="h-1.5 w-full rounded bg-violet-500/30" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-4/5 rounded bg-white/10" />
          </div>
          <div className="flex-1 h-full flex flex-col gap-1.5 pt-1">
            <div className="h-2 w-2/3 rounded bg-violet-400 mb-1" />
            <div className="h-1 w-full rounded italic bg-white/10" />
            <div className="h-1 w-full rounded bg-white/10 mb-1" />
            <div className="h-2 w-1/2 rounded bg-white/20 mb-1" />
            <div className="h-1 w-full rounded bg-white/10" />
            <div className="h-1 w-5/6 rounded bg-white/10" />
          </div>
        </div>
      ) : id === 'ats-modern-v1' ? (
        <div className="p-2 w-full">
          <div className={`h-5 w-full rounded mb-2 ${css.bar}`} />
          <div className="h-2 w-1/2 rounded mb-3 bg-blue-300" />
          <div className="h-1.5 w-full rounded mb-1 bg-gray-200" />
          <div className="h-1.5 w-full rounded mb-3 bg-gray-200" />
          <div className="h-1.5 w-3/4 rounded mb-1 bg-gray-200" />
          <div className="h-1.5 w-2/3 rounded bg-gray-200" />
        </div>
      ) : (
        <div className="p-2 w-full">
          <div className="h-3 w-2/3 rounded mb-2 bg-gray-300" />
          <div className="h-2 w-1/2 rounded mb-3 bg-gray-200" />
          <div className="h-1.5 w-full rounded mb-1 bg-gray-200" />
          <div className="h-1.5 w-full rounded mb-3 bg-gray-200" />
          <div className="h-1.5 w-3/4 rounded mb-1 bg-gray-200" />
          <div className="h-1.5 w-2/3 rounded bg-gray-200" />
        </div>
      )}
    </div>
  )
}

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-ink mb-1">Pilih Template</h3>
        <p className="text-sm text-muted">Pilih template CV yang sesuai dengan kebutuhan Anda.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {dummyTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`p-3 sm:p-4 border text-left transition-colors ${
              selected === tpl.id
                ? 'border-ink bg-ink/5'
                : 'border-border bg-surface hover:border-ink/50'
            }`}
          >
            <ThumbnailPreview id={tpl.id} />
            <h4 className="font-medium text-sm sm:text-base text-ink">{tpl.name}</h4>
            <p className="text-xs text-muted mt-1">{tpl.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
