'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'white' | 'indigo' | 'purple' | 'blue'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'white',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
  
  const colorClasses = {
    white: 'border-white border-t-transparent',
    indigo: 'border-indigo-400 border-t-transparent',
    purple: 'border-purple-400 border-t-transparent',
    blue: 'border-blue-400 border-t-transparent'
  }
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      data-testid="loading-spinner"
      aria-label="Loading"
    />
  )
}

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'white' | 'indigo' | 'purple' | 'blue'
  className?: string
}

export function LoadingState({ 
  message = 'Loading...', 
  size = 'lg',
  color = 'white',
  className = '' 
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner size={size} color={color} />
      <span className="text-slate-200 ml-3 font-medium">{message}</span>
    </div>
  )
}

interface InlineLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'white' | 'indigo' | 'purple' | 'blue'
  className?: string
}

export function InlineLoading({ 
  message = 'Loading...', 
  size = 'sm',
  color = 'white',
  className = ''
}: InlineLoadingProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <LoadingSpinner size={size} color={color} />
      <span className="text-slate-200 ml-2 text-sm">{message}</span>
    </span>
  )
}

interface ButtonLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'white' | 'indigo' | 'purple' | 'blue'
  className?: string
}

export function ButtonLoading({ 
  message = 'Processing...', 
  size = 'sm',
  color = 'white',
  className = ''
}: ButtonLoadingProps) {
  return (
    <span className={`flex items-center justify-center ${className}`}>
      <LoadingSpinner size={size} color={color} />
      <span className="ml-2">{message}</span>
    </span>
  )
}