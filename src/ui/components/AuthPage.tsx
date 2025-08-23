'use client'

import { useState, useEffect, useRef } from 'react'

export interface AuthPageProps {
  step: 'phone' | 'code'
  onPhoneSubmit: (phone: string) => void
  onCodeSubmit: (phone: string, code: string) => void
  onBack?: () => void
  phoneNumber?: string
  loading: boolean
  error?: string
}

export function AuthPage({
  step,
  onPhoneSubmit,
  onCodeSubmit,
  onBack,
  phoneNumber = '',
  loading,
  error,
}: AuthPageProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [codeError, setCodeError] = useState('')
  const codeInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus code input when step changes to code
  useEffect(() => {
    if (step === 'code' && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [step])

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, '')
    
    // If it starts with +, handle international format
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    // US format: (123) 456-7890
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (match) {
      return !match[2] ? match[1] : `(${match[1]}) ${match[2]}` + (match[3] ? `-${match[3]}` : '')
    }
    
    return cleaned
  }

  const normalizePhoneNumber = (formattedPhone: string): string => {
    // Remove formatting and add +1 for US numbers
    const cleaned = formattedPhone.replace(/[^\d+]/g, '')
    
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    
    return `+1${cleaned}`
  }

  const validatePhoneNumber = (phone: string): boolean => {
    const normalized = normalizePhoneNumber(phone)
    // Basic validation: at least 10 digits after country code
    return normalized.length >= 12 && normalized.startsWith('+')
  }

  const validateCode = (code: string): boolean => {
    return code.length === 6 && /^\d{6}$/.test(code)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
    setPhoneError('')
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const numericValue = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(numericValue)
    setCodeError('')
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePhoneNumber(phone)) {
      setPhoneError('Please enter a valid phone number')
      return
    }
    
    const normalizedPhone = normalizePhoneNumber(phone)
    onPhoneSubmit(normalizedPhone)
  }

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCode(code)) {
      setCodeError('Please enter a 6-digit verification code')
      return
    }
    
    onCodeSubmit(phoneNumber, code)
  }

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return ''
    
    // Extract digits from international format
    const digits = phone.replace(/[^\d]/g, '')
    
    // US number format
    if (phone.startsWith('+1') && digits.length === 11) {
      const usDigits = digits.slice(1) // Remove country code
      return `(${usDigits.slice(0, 3)}) ${usDigits.slice(3, 6)}-${usDigits.slice(6)}`
    }
    
    return phone
  }

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-slate-700/50">
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-lg"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-3xl">🔒</span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-blue-200 bg-clip-text text-transparent mb-3">
                Secure Your Savings Journey
              </h1>
              <p className="text-slate-300 text-lg">
                We&apos;ll send a code to verify your phone and keep your data safe
              </p>
            </div>
        
            {error && (
              <div 
                className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-2xl text-red-200 shadow-lg"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}
            
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="phone"
                  className="block text-lg font-semibold text-slate-200 mb-3"
                >
                  Phone number
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-5 py-4 text-lg text-white bg-slate-700/70 backdrop-blur-sm border-2 border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 placeholder-slate-400"
                    placeholder="(123) 456-7890"
                    aria-required="true"
                    aria-describedby="phone-help"
                    disabled={loading}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl pointer-events-none"></div>
                </div>
                
                <p id="phone-help" className="mt-3 text-sm text-slate-400 font-medium">
                  We&apos;ll send you a verification code to get started
                </p>
                {phoneError && (
                  <div className="mt-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
                    <p className="text-sm text-red-300 font-medium" role="alert">
                      {phoneError}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white text-xl font-semibold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading && (
                    <div 
                      className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"
                      data-testid="loading-spinner"
                    />
                  )}
                  {loading ? 'Sending...' : 'Start Finding Savings'}
                </span>
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-md mx-auto relative z-10">
        <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full opacity-20 blur-lg"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-3xl">📱</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-blue-200 bg-clip-text text-transparent mb-4">
              Enter your verification code
            </h1>
            
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-4 mb-2 border border-blue-700/50">
              <p className="text-slate-200 font-medium">
                We sent a code to {formatPhoneDisplay(phoneNumber)}
              </p>
            </div>
            <p className="text-slate-300 text-lg">
              Almost there! Your savings dashboard is waiting
            </p>
          </div>
          
          {error && (
            <div 
              className="mb-6 p-4 bg-red-900/50 backdrop-blur-sm border border-red-700/50 rounded-2xl text-red-200 shadow-lg"
              role="alert"
              aria-live="polite"
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleCodeSubmit} className="space-y-8">
            <div>
              <label 
                htmlFor="code"
                className="block text-lg font-semibold text-slate-200 mb-4 text-center"
              >
                Verification code
              </label>
              <div className="relative">
                <input
                  ref={codeInputRef}
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full px-6 py-6 text-3xl font-mono text-white bg-slate-700/70 backdrop-blur-sm border-2 border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300 text-center tracking-[0.5em] placeholder-slate-400"
                  placeholder="000000"
                  maxLength={6}
                  aria-required="true"
                  disabled={loading}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-2xl pointer-events-none"></div>
              </div>
              
              {codeError && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-xl">
                  <p className="text-sm text-red-300 font-medium text-center" role="alert">
                    {codeError}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white text-xl font-semibold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading && (
                    <div 
                      className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"
                      data-testid="loading-spinner"
                    />
                  )}
                  {loading ? 'Verifying...' : 'Access My Savings Dashboard'}
                </span>
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              </button>
              
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  disabled={loading}
                  className="w-full bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-lg font-medium py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}