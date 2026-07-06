import { dummyTemplates } from '../../data/dummyData'

const thumbnailStyles = {
  'ats-clean-v1': { bg: 'bg-slate-50', bar: 'bg-slate-300', accent: 'bg-slate-200' },
  'ats-modern-minimal-v1': { bg: 'bg-slate-50', bar: 'bg-slate-400', accent: 'bg-slate-600' },
  'executive-serif-v1': { bg: 'bg-stone-50', bar: 'bg-stone-400', accent: 'bg-stone-200' },
  'compact-onepage-v1': { bg: 'bg-slate-50', bar: 'bg-slate-400', accent: 'bg-slate-200' },
  'sidebar-slim-v1': { bg: 'bg-white', bar: 'bg-slate-200', accent: 'bg-slate-100' },
  'academic-minimal-v1': { bg: 'bg-stone-50', bar: 'bg-stone-400', accent: 'bg-stone-200' },
  'technical-minimal-v1': { bg: 'bg-slate-50', bar: 'bg-slate-400', accent: 'bg-slate-200' },
  'fresh-graduate-minimal-v1': { bg: 'bg-slate-50', bar: 'bg-slate-400', accent: 'bg-slate-200' },
  'timeline-minimal-v1': { bg: 'bg-slate-50', bar: 'bg-slate-400', accent: 'bg-slate-200' },
  'two-tone-minimal-v1': { bg: 'bg-slate-50', bar: 'bg-slate-800', accent: 'bg-slate-400' },
}

function ThumbnailPreview({ id }) {
  const css = thumbnailStyles[id] || thumbnailStyles['ats-clean-v1']

  if (id === 'sidebar-slim-v1') {
    return (
      <div className="w-full aspect-[1.414/1] mb-3 flex items-center justify-center text-xs overflow-hidden bg-slate-50 border border-slate-200">
        <div className="flex w-full h-full">
          <div className="w-[28%] h-full bg-slate-100 p-1.5 flex flex-col gap-1 border-r border-slate-200">
            <div className="h-1 w-full rounded bg-slate-300" />
            <div className="h-0.5 w-3/4 rounded bg-slate-200 mb-1" />
            <div className="h-0.5 w-full rounded bg-slate-200" />
            <div className="h-0.5 w-5/6 rounded bg-slate-200" />
            <div className="h-0.5 w-4/5 rounded bg-slate-200" />
          </div>
          <div className="flex-1 h-full p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-1/2 rounded bg-slate-400 mb-0.5" />
            <div className="h-1 w-full rounded bg-slate-200" />
            <div className="h-1 w-5/6 rounded bg-slate-200" />
            <div className="h-1 w-full rounded bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (id === 'timeline-minimal-v1') {
    return (
      <div className="w-full aspect-[1.414/1] mb-3 flex items-center justify-center text-xs overflow-hidden bg-slate-50 border border-slate-200">
        <div className="p-2 w-full flex flex-col gap-1">
          <div className="h-1.5 w-1/3 rounded bg-slate-400 mb-1" />
          <div className="flex gap-2 items-stretch h-12">
            <div className="w-1 flex flex-col items-center relative">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <div className="w-0.5 flex-1 bg-slate-300 my-0.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div>
                <div className="h-1 w-1/2 rounded bg-slate-300" />
                <div className="h-0.5 w-full rounded bg-slate-200" />
              </div>
              <div>
                <div className="h-1 w-1/2 rounded bg-slate-300" />
                <div className="h-0.5 w-full rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (id === 'ats-modern-minimal-v1') {
    return (
      <div className="w-full aspect-[1.414/1] mb-3 flex items-center justify-center text-xs overflow-hidden bg-slate-50 border border-slate-200">
        <div className="p-2 w-full flex flex-col gap-1">
          <div className="h-2.5 w-1/3 rounded bg-slate-700" />
          <div className="h-0.5 w-10 bg-slate-500 mb-1" />
          <div className="h-1 w-full rounded bg-slate-200" />
          <div className="h-1 w-3/4 rounded bg-slate-200 mb-1" />
          <div className="h-1.5 w-1/2 rounded bg-slate-300" />
          <div className="h-1 w-full rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  // Fallback for general 1-column layout
  return (
    <div className="w-full aspect-[1.414/1] mb-3 flex items-center justify-center text-xs overflow-hidden bg-slate-50 border border-slate-200">
      <div className="p-2 w-full flex flex-col gap-1">
        <div className="h-2 w-1/2 rounded mb-1 bg-slate-400" />
        <div className="h-1 w-full rounded bg-slate-200" />
        <div className="h-1 w-full rounded bg-slate-200 mb-1" />
        <div className="h-1.5 w-1/3 rounded bg-slate-300" />
        <div className="h-1 w-full rounded bg-slate-200" />
        <div className="h-1 w-4/5 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {dummyTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`p-3 sm:p-4 border text-left transition-colors ${
              selected === tpl.id
                ? 'border-ink bg-ink/5 font-semibold'
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
