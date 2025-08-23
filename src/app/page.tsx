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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

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
      
      if (!response.ok) {
        let errorMessage = 'Failed to send verification code'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
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
      
      if (!response.ok) {
        let errorMessage = 'Failed to verify code'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
      if (false) { // This condition will never be true now
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

  // Check for existing authentication on page load
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Validate that user data has required fields
          if (userData && userData.id && userData.phone) {
            setIsAuthenticated(true)
            return
          }
        }
        // If no valid user data, ensure we're not authenticated
        setIsAuthenticated(false)
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkExistingAuth()
  }, [])

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-sm mx-auto text-center relative z-10">
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-10 shadow-2xl border border-slate-700/50">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-slate-200 bg-clip-text text-transparent mb-2">
                Loading...
              </h3>
              <p className="text-slate-300">Checking authentication</p>
            </div>
          </div>
        </div>
      </div>
    )
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
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  // Load user and their services from localStorage and API
  useEffect(() => {
    const loadUserAndServices = async () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          dispatch({ type: 'SET_USER', payload: userData })
          
          // Load user's existing services
          try {
            const response = await fetch(`/api/user-services?userId=${userData.id}`)
            if (response.ok) {
              const result = await response.json()
              const userServices = result.userServices || []
              dispatch({ type: 'SET_USER_SERVICES', payload: userServices })
              
              // Determine where to send the user based on their services
              if (userServices.length > 0) {
                // User has services, send them to dashboard
                dispatch({ type: 'SET_STEP', payload: 'dashboard' })
              } else {
                // User has no services, continue onboarding
                dispatch({ type: 'SET_STEP', payload: 'visual-services' })
              }
            } else {
              console.error('Failed to load user services:', response.status)
              // If we can't load services, default to service selection
              dispatch({ type: 'SET_STEP', payload: 'visual-services' })
            }
          } catch (error) {
            console.error('Error loading user services:', error)
            // If we can't load services, default to service selection
            dispatch({ type: 'SET_STEP', payload: 'visual-services' })
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          localStorage.removeItem('user')
          // If user data is invalid, start with welcome screen
          dispatch({ type: 'SET_STEP', payload: 'welcome' })
        }
      } else {
        // No stored user, start with welcome screen
        dispatch({ type: 'SET_STEP', payload: 'welcome' })
      }
      
      setIsLoadingUserData(false)
    }

    loadUserAndServices()
  }, [])

  const handleGetStarted = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
  }

  // Show loading while determining user state
  if (isLoadingUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-sm mx-auto text-center relative z-10">
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-10 shadow-2xl border border-slate-700/50">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-slate-200 bg-clip-text text-transparent mb-2">
                Loading your dashboard...
              </h3>
              <p className="text-slate-300">Preparing your services</p>
            </div>
          </div>
        </div>
      </div>
    )
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
