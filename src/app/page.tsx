'use client'

import { useState } from 'react'
import { AuthPage } from '@/ui/components/AuthPage'

export default function Home() {
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handlePhoneSubmit = async (phone: string) => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPhoneNumber(phone)
      setStep('code')
    } catch (err) {
      setError('Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (phone: string, code: string) => {
    setLoading(true)
    setError(undefined)
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (code === '123456') {
        setIsAuthenticated(true)
      } else {
        setError('Invalid verification code')
      }
    } catch (err) {
      setError('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setError(undefined)
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome! Let&apos;s set up your services
            </h1>
            <p className="text-gray-600">
              Start by selecting the services you currently use.
            </p>
          </div>
          
          <div className="space-y-4">
            <div 
              data-testid="category-streaming"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎬</span>
                <div>
                  <h3 className="font-medium text-gray-900">Streaming & Entertainment</h3>
                  <p className="text-sm text-gray-600">Netflix, Hulu, Disney+, etc.</p>
                </div>
              </div>
            </div>
            
            <div 
              data-testid="category-groceries"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-medium text-gray-900">Groceries</h3>
                  <p className="text-sm text-gray-600">Walmart, Target, Kroger, etc.</p>
                </div>
              </div>
            </div>
            
            <div 
              data-testid="category-internet"
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📡</span>
                <div>
                  <h3 className="font-medium text-gray-900">Internet / Phone</h3>
                  <p className="text-sm text-gray-600">Verizon, AT&T, Comcast, etc.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthPage
        step={step}
        onPhoneSubmit={handlePhoneSubmit}
        onCodeSubmit={handleCodeSubmit}
        onBack={step === 'code' ? handleBack : undefined}
        phoneNumber={phoneNumber}
        loading={loading}
        error={error}
      />
    </div>
  )
}
