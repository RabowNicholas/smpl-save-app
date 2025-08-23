'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { ServiceSelector } from './ServiceSelector'
import { ProgressIndicator } from './ProgressIndicator'

export function ServicesPage() {
  const { state, dispatch } = useApp()
  const { 
    user, 
    selectedCategory, 
    services, 
    selectedServices, 
    loading, 
    error 
  } = state
  
  const [searchTerm, setSearchTerm] = useState('')
  const [savingService, setSavingService] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCategory) {
      loadServices()
      if (user) {
        loadUserServices()
      }
    }
  }, [selectedCategory, user])

  const loadServices = async () => {
    if (!selectedCategory) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      const response = await fetch(`/api/services/${selectedCategory.id}`)
      
      if (!response.ok) {
        let errorMessage = 'Failed to load services'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
      dispatch({ type: 'SET_SERVICES', payload: result.services })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadUserServices = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/user-services?userId=${user.id}`)
      
      if (response.ok) {
        const result = await response.json()
        dispatch({ type: 'SET_USER_SERVICES', payload: result.userServices })
      }
    } catch (error) {
      console.error('Failed to load user services:', error)
    }
  }

  const handleServiceToggle = async (serviceId: string, selected: boolean) => {
    if (!user) return
    
    setSavingService(serviceId)
    
    try {
      if (selected) {
        // Add service
        const response = await fetch('/api/user-services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, serviceId })
        })
        
        if (!response.ok) {
          let errorMessage = 'Failed to save service'
          try {
            const result = await response.json()
            errorMessage = result.error || errorMessage
          } catch {
            // If JSON parsing fails, use default error message
          }
          throw new Error(errorMessage)
        }
      } else {
        // Remove service
        const response = await fetch(`/api/user-services?userId=${user.id}&serviceId=${serviceId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          let errorMessage = 'Failed to remove service'
          try {
            const result = await response.json()
            errorMessage = result.error || errorMessage
          } catch {
            // If JSON parsing fails, use default error message
          }
          throw new Error(errorMessage)
        }
      }
      
      // Update local state
      dispatch({ type: 'TOGGLE_SERVICE', payload: serviceId })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      setSavingService(null)
    }
  }

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: null })
    dispatch({ type: 'SET_SERVICES', payload: [] })
    setSearchTerm('')
  }

  const handleContinue = () => {
    dispatch({ type: 'SET_STEP', payload: 'progress' })
  }

  const handleRetry = () => {
    loadServices()
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No category selected</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <ProgressIndicator 
          currentStep={2}
          totalSteps={3}
          steps={['Categories', 'Services', 'Savings Dashboard']}
        />
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Categories
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <span className="text-3xl mr-3">{selectedCategory.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">
              Track your {selectedCategory.name}
            </h1>
          </div>
          
          <p className="text-gray-600 mb-2">
            Select the services you currently pay for in this category
          </p>
          <p className="text-sm text-green-600 font-medium">
            💡 We&apos;ll identify potential savings for each service
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-center">
            {error}
            <button
              onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Service Selector */}
        <div className="mb-8">
          <ServiceSelector
            services={services}
            selectedServices={selectedServices}
            onServiceToggle={handleServiceToggle}
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
            loading={loading}
            error={error || undefined}
            onRetry={handleRetry}
          />
        </div>

        {/* Continue Button */}
        {selectedServices.length > 0 && !loading && (
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={savingService !== null}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
{savingService ? 'Saving...' : `View My Savings Dashboard (${selectedServices.length} services)`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}