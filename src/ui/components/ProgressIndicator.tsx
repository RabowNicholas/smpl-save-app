'use client'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: string[]
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          
          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold shadow-lg transition-all duration-300
                ${isCompleted 
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25' 
                  : isActive 
                    ? 'bg-gradient-to-br from-red-600 via-orange-500 to-red-700 text-white shadow-red-500/25 ring-2 ring-orange-500/20' 
                    : 'bg-slate-700/70 border border-slate-600/40 text-slate-400'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-4 rounded-full transition-all duration-300
                  ${isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm' 
                    : 'bg-slate-700/50'
                  }
                `} />
              )}
            </div>
          )
        })}
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between text-sm">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          
          return (
            <div 
              key={step}
              className={`
                text-center font-medium transition-colors duration-300
                ${isCompleted 
                  ? 'text-emerald-400' 
                  : isActive 
                    ? 'text-orange-200' 
                    : 'text-slate-400'
                }
              `}
            >
              {step}
            </div>
          )
        })}
      </div>
    </div>
  )
}