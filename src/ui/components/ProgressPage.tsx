'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service } from '@/core/types'

export function ProgressPage() {
  const { state, dispatch } = useApp()
  const { user, selectedServices, services } = state
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSelectedServiceDetails()
  }, [selectedServices, services])

  const loadSelectedServiceDetails = async () => {
    setLoading(true)
    
    try {
      // If we have services already loaded, filter them
      if (services.length > 0) {
        const filtered = services.filter(service => selectedServices.includes(service.id))
        setSelectedServiceDetails(filtered)
      } else {
        // Otherwise fetch all services and filter
        // This handles the case where user navigates directly to progress
        const categoriesResponse = await fetch('/api/categories')
        if (!categoriesResponse.ok) {
          throw new Error(`Failed to fetch categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`)
        }
        const allCategories = await categoriesResponse.json()
        const allServices: Service[] = []
        
        for (const category of allCategories.categories) {
          const servicesResponse = await fetch(`/api/services/${category.id}`)
          if (!servicesResponse.ok) {
            console.error(`Failed to fetch services for category ${category.id}: ${servicesResponse.status} ${servicesResponse.statusText}`)
            continue // Skip this category instead of failing entirely
          }
          const categoryServices = await servicesResponse.json()
          allServices.push(...categoryServices.services)
        }
        
        const filtered = allServices.filter(service => selectedServices.includes(service.id))
        setSelectedServiceDetails(filtered)
      }
    } catch (error) {
      console.error('Failed to load service details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCategories = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: null })
    dispatch({ type: 'SET_SERVICES', payload: [] })
  }

  const handleBackToServices = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
  }

  const handleViewDashboard = () => {
    dispatch({ type: 'SET_STEP', payload: 'dashboard' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-sm mx-auto text-center relative z-10">
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-10 shadow-2xl border border-slate-700/50">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"
                  data-testid="loading-spinner"
                />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-slate-200 bg-clip-text text-transparent mb-2">
                Loading your services...
              </h3>
              <p className="text-slate-300">Just a moment</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Services Selected
          </h1>
          <p className="text-gray-600 mb-6">
            You haven&apos;t selected any services yet. Go back to choose some services to track.
          </p>
          <button
            onClick={handleBackToCategories}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Select Services
          </button>
        </div>
      </div>
    )
  }

  // Focus on service organization and tracking

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Celebration particle effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Floating background gradients */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-lg mx-auto text-center relative z-10">
        {/* Glassmorphic celebration container */}
        <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-10 shadow-2xl border border-slate-700/50 mb-8">
          {/* Enhanced celebration visual */}
          <div className="mb-12">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
              {/* Multiple glow layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full opacity-40 blur-lg"></div>
              
              {/* Main celebration icon */}
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                <span className="text-5xl sm:text-7xl animate-bounce" style={{ animationDuration: '2s' }}>🎉</span>
              </div>
              
              {/* Floating celebration elements */}
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>💫</div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6">
              Great progress!
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-200 font-medium mb-4">
              You&apos;re now tracking
            </p>
            
            {/* Enhanced service count display */}
            <div className="relative mb-6">
              <div className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 bg-clip-text text-transparent mb-2 leading-none">
                {selectedServiceDetails.length}
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-2xl blur-lg"></div>
              
              <p className="text-xl sm:text-2xl text-slate-300 font-semibold">
                {selectedServiceDetails.length === 1 ? 'service' : 'services'}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-slate-800/50 to-blue-900/50 rounded-2xl p-4 mb-6 border border-slate-700/50">
              <p className="text-slate-300 font-medium">
                You&apos;ve organized{' '}
                <span className="font-bold text-slate-100">{selectedServiceDetails.length} subscription{selectedServiceDetails.length !== 1 ? 's' : ''}</span>
                {' '}in one place!
              </p>
            </div>
            
            {/* Enhanced partnership message */}
            <div className="bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-blue-700/50 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                    💡
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-blue-200 mb-3">Group pricing coming soon!</h3>
                  <p className="text-sm text-blue-100 leading-relaxed mb-3">
                    We&apos;re building partnerships to get you group deals and exclusive discounts on your subscriptions.
                  </p>
                  <p className="text-sm text-purple-200 font-medium">
                    Thank you for joining the smpl life! ✨
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced action buttons */}
        <div className="space-y-4">
          <button
            onClick={handleBackToServices}
            className="group relative w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center">
              Add More Services
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </button>
          
          <button
            onClick={handleViewDashboard}
            className="group w-full bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-lg font-medium py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              View My Dashboard
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}