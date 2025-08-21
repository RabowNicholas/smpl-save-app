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
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Sign in with your phone
        </h1>
        
        {error && (
          <div 
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
        
        <form onSubmit={handlePhoneSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(123) 456-7890"
              aria-required="true"
              aria-describedby="phone-help"
              disabled={loading}
            />
            <p id="phone-help" className="mt-1 text-sm text-gray-600">
              We&apos;ll send you a verification code
            </p>
            {phoneError && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {phoneError}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <div 
                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                data-testid="loading-spinner"
              />
            )}
            {loading ? 'Sending...' : 'Send verification code'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Enter verification code
      </h1>
      
      <p className="text-gray-600 text-center mb-6">
        We sent a code to {formatPhoneDisplay(phoneNumber)}
      </p>
      
      {error && (
        <div 
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      
      <form onSubmit={handleCodeSubmit}>
        <div className="mb-6">
          <label 
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Verification code
          </label>
          <input
            ref={codeInputRef}
            id="code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            aria-required="true"
            disabled={loading}
          />
          {codeError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {codeError}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <div 
                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                data-testid="loading-spinner"
              />
            )}
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
          )}
        </div>
      </form>
    </div>
  )
}