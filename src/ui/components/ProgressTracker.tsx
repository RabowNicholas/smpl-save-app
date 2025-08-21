'use client'

import { CategoryProgress, OverallProgress, Category } from '@/core/types'

export interface ProgressTrackerProps {
  categoryProgress: CategoryProgress[]
  overallProgress: OverallProgress
  categories: Category[]
  onCategoryClick: (categoryId: string) => void
  loading: boolean
  compact?: boolean
  disableCompletedCategories?: boolean
}

export function ProgressTracker({
  categoryProgress,
  overallProgress,
  categories,
  onCategoryClick,
  loading,
  compact = false,
  disableCompletedCategories = false,
}: ProgressTrackerProps) {
  const handleCategoryClick = (categoryId: string, status: string) => {
    if (disableCompletedCategories && status === 'completed') {
      return
    }
    onCategoryClick(categoryId)
  }

  const handleKeyDown = (event: React.KeyboardEvent, categoryId: string, status: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCategoryClick(categoryId, status)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12" data-testid="progress-tracker">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"
          data-testid="loading-spinner"
        />
        <p className="text-gray-600">Loading progress...</p>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12" data-testid="progress-tracker">
        <p className="text-gray-600">No categories available</p>
      </div>
    )
  }

  const isComplete = overallProgress.completionPercentage === 100
  const progressPercentage = Math.round(overallProgress.completionPercentage)

  return (
    <div 
      className={`w-full ${compact ? 'compact' : ''}`} 
      data-testid="progress-tracker"
    >
      {/* Overall Progress Header */}
      <div className="text-center mb-8">
        {/* Circular Progress */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallProgress.completionPercentage / 100)}`}
              className="text-blue-600 transition-all duration-500 ease-out"
              data-testid="progress-circle"
              data-progress={overallProgress.completionPercentage}
            />
          </svg>
          
          {/* Progress text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {isComplete ? (
                <div>
                  <div className="text-2xl">🎉</div>
                  <div className="text-xs font-medium text-gray-600">All done!</div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-gray-900">{progressPercentage}%</div>
                  <div className="text-xs font-medium text-gray-600">Complete</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        {!compact && (
          <div className="space-y-1 text-sm text-gray-600">
            <p>{overallProgress.categoriesCompleted} of {overallProgress.totalCategories} categories completed</p>
            <p>{overallProgress.servicesSelected} of {overallProgress.totalServices} services selected</p>
          </div>
        )}
      </div>

      {/* Accessibility Progress Bar */}
      <div
        role="progressbar"
        aria-valuenow={overallProgress.completionPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall progress: ${progressPercentage}% complete`}
        className="sr-only"
      />

      {/* Category List */}
      <div 
        role="list"
        aria-label="Category progress"
        className="space-y-3"
      >
        {categories.map((category) => {
          const progress = categoryProgress.find(cp => cp.categoryId === category.id)
          if (!progress) return null

          const isClickable = !disableCompletedCategories || progress.status !== 'completed'

          return (
            <div
              key={category.id}
              role="listitem"
              data-testid={`category-${category.id}`}
              tabIndex={isClickable ? 0 : -1}
              aria-label={`${category.name}: ${progress.status}, ${progress.selectedServices.length} of ${progress.totalServices} services selected`}
              className={`
                flex items-center p-4 rounded-lg border-2 transition-all duration-200
                ${progress.status === 'completed' ? 'border-green-200 bg-green-50 completed' : ''}
                ${progress.status === 'in-progress' ? 'border-blue-200 bg-blue-50 in-progress' : ''}
                ${progress.status === 'incomplete' ? 'border-gray-200 bg-gray-50 incomplete' : ''}
                ${isClickable ? 'cursor-pointer hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none' : 'cursor-default'}
              `}
              onClick={() => handleCategoryClick(category.id, progress.status)}
              onKeyDown={(e) => handleKeyDown(e, category.id, progress.status)}
            >
              {/* Category Icon */}
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-white border mr-4">
                <span className="text-2xl">{category.icon}</span>
              </div>

              {/* Category Info */}
              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                <div className="flex items-center space-x-3">
                  {/* Progress indicator */}
                  {progress.status === 'completed' ? (
                    <div className="flex items-center text-green-600">
                      <svg 
                        className="w-4 h-4 mr-1"
                        data-testid={`check-icon-${category.id}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Complete</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">
                        {progress.selectedServices.length} of {progress.totalServices}
                      </span>
                      {progress.totalServices > 0 && (
                        <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                            style={{
                              width: `${(progress.selectedServices.length / progress.totalServices) * 100}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow indicator for clickable items */}
              {isClickable && (
                <div className="flex-shrink-0 ml-4">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}