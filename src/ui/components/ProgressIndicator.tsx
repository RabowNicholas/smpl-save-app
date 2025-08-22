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
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          
          return (
            <div key={step} className="flex items-center">
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-1 mx-2
                  ${isCompleted || (isActive && index < currentStep - 1) 
                    ? 'bg-green-500' 
                    : 'bg-gray-200'
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
                text-center font-medium
                ${isCompleted 
                  ? 'text-green-600' 
                  : isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
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