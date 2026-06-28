export default function Stepper({ steps, currentStep, onStepClick }) {
 return (
 <div className="flex items-center gap-1 w-full">
 {steps.map((step, index) => {
 const isCompleted = index < currentStep
 const isCurrent = index === currentStep
 const isClickable = index <= currentStep || isCompleted

 return (
 <div key={index} className="flex-1 flex items-center">
 <button
 onClick={() => isClickable && onStepClick?.(index)}
 disabled={!isClickable}
 className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
 ${isCurrent ? 'bg-ink text-white' : ''}
 ${isCompleted ? 'text-success' : ''}
 ${!isCurrent && !isCompleted ? 'text-muted ' : ''}
 ${isClickable && !isCurrent ? 'hover:bg-border cursor-pointer' : 'cursor-default'}
 ${!isClickable ? 'opacity-50' : ''}
 `}
 >
 <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
 ${isCurrent ? 'bg-white text-ink ' : ''}
 ${isCompleted ? 'bg-success/10 text-success' : ''}
 ${!isCurrent && !isCompleted ? 'bg-border text-muted ' : ''}
 `}>
 {isCompleted ? (
 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 ) : index + 1}
 </span>
 <span className="hidden md:inline">{step}</span>
 </button>
 {index < steps.length - 1 && (
 <div className={`flex-1 h-0.5 mx-1 ${index < currentStep ? 'bg-ink ' : 'bg-border '}`} />
 )}
 </div>
 )
 })}
 </div>
 )
}
