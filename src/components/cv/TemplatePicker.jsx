import { dummyTemplates } from '../../data/dummyData'

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-h3 text-text-primary dark:text-text-primary-dark mb-1">Pilih Template</h3>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Pilih template CV yang sesuai dengan kebutuhan Anda.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {dummyTemplates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`text-left p-5 rounded-card border-2 transition-all ${
              selected === tpl.id
                ? 'border-primary bg-primary/5'
                : 'border-border dark:border-border-dark bg-white dark:bg-slate-800 hover:border-primary/50'
            }`}
          >
            <div className={`w-full aspect-[1.414/1] rounded-lg mb-3 flex items-center justify-center text-xs ${
              tpl.id === 'ats-clean-v1' ? 'bg-gray-50 dark:bg-slate-700' : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className="p-3 w-full">
                <div className={`h-3 w-2/3 rounded mb-2 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-300 dark:bg-slate-600' : 'bg-blue-300'}`} />
                <div className={`h-2 w-1/2 rounded mb-3 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 dark:bg-slate-600' : 'bg-blue-200'}`} />
                <div className={`h-2 w-full rounded mb-1 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 dark:bg-slate-600' : 'bg-blue-200'}`} />
                <div className={`h-2 w-full rounded mb-3 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 dark:bg-slate-600' : 'bg-blue-200'}`} />
                <div className={`h-2 w-3/4 rounded mb-1 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 dark:bg-slate-600' : 'bg-blue-200'}`} />
                <div className={`h-2 w-2/3 rounded ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 dark:bg-slate-600' : 'bg-blue-200'}`} />
              </div>
            </div>
            <h4 className="font-medium text-text-primary dark:text-text-primary-dark">{tpl.name}</h4>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">{tpl.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
