import { dummyTemplates } from '../../data/dummyData'

export default function TemplatePicker({ selected, onSelect }) {
 return (
 <div className="space-y-4">
 <div>
 <h3 className="text-lg font-semibold text-ink mb-1">Pilih Template</h3>
 <p className="text-sm text-muted ">Pilih template CV yang sesuai dengan kebutuhan Anda.</p>
 </div>
 <div className="grid md:grid-cols-2 gap-4">
 {dummyTemplates.map((tpl) => (
 <button
 key={tpl.id}
 onClick={() => onSelect(tpl.id)}
 className={`text-left p-5 border-2 transition-all ${
 selected === tpl.id
 ? 'border-ink bg-ink/5'
 : 'border-border bg-surface hover:border-ink/50'
 }`}
 >
 <div className={`w-full aspect-[1.414/1] rounded-lg mb-3 flex items-center justify-center text-xs ${
 tpl.id === 'ats-clean-v1' ? 'bg-gray-50 ' : 'bg-blue-50 '
 }`}>
 <div className="p-3 w-full">
 <div className={`h-3 w-2/3 rounded mb-2 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-300 ' : 'bg-blue-300'}`} />
 <div className={`h-2 w-1/2 rounded mb-3 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 ' : 'bg-blue-200'}`} />
 <div className={`h-2 w-full rounded mb-1 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 ' : 'bg-blue-200'}`} />
 <div className={`h-2 w-full rounded mb-3 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 ' : 'bg-blue-200'}`} />
 <div className={`h-2 w-3/4 rounded mb-1 ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 ' : 'bg-blue-200'}`} />
 <div className={`h-2 w-2/3 rounded ${tpl.id === 'ats-clean-v1' ? 'bg-gray-200 ' : 'bg-blue-200'}`} />
 </div>
 </div>
 <h4 className="font-medium text-ink ">{tpl.name}</h4>
 <p className="text-xs text-muted mt-1">{tpl.description}</p>
 </button>
 ))}
 </div>
 </div>
 )
}
