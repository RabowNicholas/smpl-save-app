'use client'

import { useState, useEffect } from 'react'
import { AuthPage } from '@/ui/components/AuthPage'
import { AppProvider, useApp } from '@/ui/context/AppContext'
import { WelcomeScreen } from '@/ui/components/WelcomeScreen'
import { VisualServicesPage } from '@/ui/components/VisualServicesPage'
import { ProgressPage } from '@/ui/components/ProgressPage'
import { Dashboard } from '@/ui/components/Dashboard'

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
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send verification code')
      }
      
      setPhoneNumber(phone)
      setStep('code')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (phone: string, code: string) => {
    setLoading(true)
    setError(undefined)
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to verify code')
      }
      
      const user = result.user
      setIsAuthenticated(true)
      // Store user data for later use
      localStorage.setItem('user', JSON.stringify(user))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify code'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setError(undefined)
  }

  if (isAuthenticated) {
    return <MainApp />
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

function MainApp() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

function AppContent() {
  const { state, dispatch } = useApp()
  const { currentStep, user } = state

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        dispatch({ type: 'SET_USER', payload: userData })
        // If user exists, skip welcome screen
        if (currentStep === 'welcome') {
          dispatch({ type: 'SET_STEP', payload: 'visual-services' })
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [currentStep])

  const handleGetStarted = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
  }

  switch (currentStep) {
    case 'welcome':
      return <WelcomeScreen onGetStarted={handleGetStarted} />
    case 'visual-services':
      return <VisualServicesPage />
    case 'progress':
      return <ProgressPage />
    case 'dashboard':
      return <Dashboard />
    default:
      return <WelcomeScreen onGetStarted={handleGetStarted} />
  }
}
