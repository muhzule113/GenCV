export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden sm:flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = index <= currentStep || isCompleted

          return (
            <div key={index} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`flex items-center gap-2 px-2 py-2 text-xs font-medium transition-colors duration-150
                  ${isCurrent ? 'bg-ink text-paper' : ''}
                  ${isCompleted ? 'text-success' : ''}
                  ${!isCurrent && !isCompleted ? 'text-muted' : ''}
                  ${isClickable && !isCurrent ? 'hover:bg-ink/5 cursor-pointer' : 'cursor-default'}
                  ${!isClickable ? 'opacity-40' : ''}
                `}
              >
                <span className={`flex items-center justify-center w-6 h-6 text-[11px] font-bold font-mono
                  ${isCurrent ? 'bg-paper text-ink' : ''}
                  ${isCompleted ? 'bg-success text-paper' : ''}
                  ${!isCurrent && !isCompleted ? 'bg-border text-muted' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden md:inline">{step}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors duration-150 ${
                  isCompleted ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Stepper - Compact Dropdown Style */}
      <div className="sm:hidden">
        <div className="flex items-center gap-3 mb-3">
          <span className={`flex items-center justify-center w-8 h-8 text-sm font-bold font-mono bg-ink text-paper`}>
            {currentStep + 1}
          </span>
          <div className="flex-1">
            <p className="text-xs font-mono text-clip uppercase tracking-wider mb-0.5">
              Langkah {currentStep + 1} dari {steps.length}
            </p>
            <p className="text-sm font-medium text-ink">{steps[currentStep]}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep
            const isClickable = index <= currentStep || isCompleted

            return (
              <button
                key={index}
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={`flex-1 h-1.5 transition-colors duration-150 border-0 ${
                  isCurrent || isCompleted ? 'bg-ink' : 'bg-border'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                aria-label={`Langkah ${index + 1}: ${step}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
