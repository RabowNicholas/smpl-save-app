'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service } from '@/core/types'
import { NotificationModal } from './Modal'
import { ProgressIndicator } from './ProgressIndicator'

export function ProgressPage() {
  const { state, dispatch } = useApp()
  const { user, selectedServices, services } = state
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareNotification, setShowShareNotification] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black flex items-center justify-center px-6 relative overflow-hidden">
        {/* Rebel floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          {/* SMPL Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-orange-500 to-red-700 bg-clip-text text-transparent animate-pulse">
              smpl
            </h1>
          </div>
          
          <div className="backdrop-blur-sm bg-slate-900/95 rounded-2xl p-8 shadow-2xl border border-red-900/30 ring-1 ring-red-500/20">
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-600 rounded-full opacity-20 blur-lg"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center shadow-xl">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"
                    data-testid="loading-spinner"
                  />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-200 via-red-300 to-orange-200 bg-clip-text text-transparent mb-3">
                Group discounts on insurance, internet, phones & more
              </h1>
              <p className="text-orange-200 text-lg font-medium mb-4">
                Save together
              </p>
              <p className="text-slate-200 text-base">
                Loading your tracked services...
              </p>
            </div>
          </div>
          
          {/* live.smpl Branding */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">live.smpl</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Rebel celebration particle effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Rebel floating background gradients */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/15 to-orange-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-500/15 to-red-600/15 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-lg mx-auto text-center relative z-10">
        {/* SMPL Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-orange-500 to-red-700 bg-clip-text text-transparent animate-pulse">
            smpl
          </h1>
        </div>
        
        {/* Progress indicator */}
        <ProgressIndicator 
          currentStep={3}
          totalSteps={3}
          steps={['Sign Up', 'Select Services', 'Track & Save']}
        />
        
        {/* Rebel glassmorphic celebration container */}
        <div className="backdrop-blur-sm bg-slate-900/95 rounded-2xl p-10 shadow-2xl border border-red-900/30 mb-8 ring-1 ring-red-500/20">
          {/* Enhanced celebration visual */}
          <div className="mb-12">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-8">
              {/* Rebel glow layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full opacity-40 blur-lg"></div>
              
              {/* Main rebel celebration icon */}
              <div className="relative w-full h-full bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-orange-200/40">
                <span className="text-5xl sm:text-7xl animate-bounce" style={{ animationDuration: '2s' }}>🔥</span>
              </div>
              
              {/* Floating rebel elements */}
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>⚡</div>
              <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>💪</div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-200 via-red-300 to-orange-200 bg-clip-text text-transparent mb-6">
              Thanks for joining
            </h1>
            
            <p className="text-lg sm:text-xl text-orange-200 font-medium mb-4">
              You&apos;re now tracking
            </p>
            
            {/* Enhanced service count display - Rebel theme */}
            <div className="relative mb-6">
              <div className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2 leading-none">
                {selectedServiceDetails.length}
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl blur-lg"></div>
              
              <p className="text-xl sm:text-2xl text-red-200 font-bold">
                {selectedServiceDetails.length === 1 ? 'service tracked' : 'services tracked'}
              </p>
              <p className="text-lg text-orange-200 font-medium mt-2">
                Group savings coming soon
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-red-950/60 to-slate-900/80 rounded-lg p-4 mb-6 border border-red-800/40 ring-1 ring-red-600/20">
              <p className="text-red-100 font-bold">
                You&apos;re tracking{' '}
                <span className="font-black text-orange-200">{selectedServiceDetails.length} subscription{selectedServiceDetails.length !== 1 ? 's' : ''}</span>
                {' '}for group savings!
              </p>
            </div>
            
            {/* Enhanced partnership message - Rebel twist */}
            <div className="bg-gradient-to-r from-red-950/60 via-orange-950/50 to-red-950/60 rounded-lg p-6 border border-red-800/40 shadow-lg ring-1 ring-red-600/20">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-lg">
                    🤝
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-orange-200 mb-3">Community power works</h3>
                  <p className="text-sm text-red-100 leading-relaxed mb-3">
                    We&apos;re building partnerships to get you group deals and exclusive discounts on your subscriptions. <span className="font-bold text-orange-200">Together we negotiate better</span> than any individual ever could.
                  </p>
                  <p className="text-sm text-orange-300 font-bold">
                    <span className="text-red-300">Stop paying full price.</span> Start saving together! 💪
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community invitation section */}
        <div className="bg-gradient-to-r from-red-900/30 via-orange-900/30 to-red-900/30 rounded-2xl p-6 mb-6 border border-red-700/30 shadow-lg">
          <div className="text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-bold text-orange-200 mb-3 text-lg">Invite Friends, Save More</h3>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">
              Every person who joins increases our group buying power with companies. 
              <span className="font-semibold text-orange-200">More members = better deals for everyone!</span>
            </p>
            
            {/* Why invite others - value propositions */}
            <div className="bg-slate-800/40 rounded-lg p-4 mb-4 text-left">
              <h4 className="text-sm font-bold text-red-200 mb-2">Why your friends should join:</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Free to track subscriptions & find savings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Access to exclusive group discounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Community-driven pricing power</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-300">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                <span>More members</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                <span>Better deals</span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span>Save together</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary and secondary CTAs (flipped) - Rebel styling */}
        <div className="space-y-4">
          <button
            onClick={() => {
              // Web Share API or fallback copy link functionality
              if (navigator.share) {
                navigator.share({
                  title: 'Join SMPL for group savings!',
                  text: 'Track your subscriptions and get group discounts! More members = better deals for everyone.',
                  url: window.location.origin
                })
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.origin)
                setShowShareNotification(true)
              }
            }}
            className="group relative w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-700 hover:from-red-700 hover:via-orange-600 hover:to-red-800 text-white text-xl font-black py-6 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-red-500/25 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-orange-500/20 hover:ring-orange-400/40"
          >
            <span className="relative z-10 flex items-center justify-center">
              🚀 INVITE FRIENDS
              <svg className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-1 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </span>
            {/* Aggressive glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-red-500 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            {/* Additional dramatic shadow */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-700 rounded-lg blur opacity-20"></div>
          </button>
          
          <button
            onClick={handleViewDashboard}
            className="group w-full bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-lg font-semibold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              View My Dashboard
              <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          
          <button
            onClick={handleBackToServices}
            className="group w-full bg-slate-700/50 backdrop-blur-sm hover:bg-slate-700/70 text-slate-300 hover:text-slate-200 text-base font-medium py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              Add More Services
              <svg className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </button>
        </div>
        
        {/* live.smpl Branding */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">live.smpl</p>
        </div>
        
        {/* Share Notification Modal */}
        <NotificationModal
          isOpen={showShareNotification}
          onClose={() => setShowShareNotification(false)}
          title="Link Copied!"
          message="Share with friends to increase our group buying power! The more members, the better deals for everyone."
          type="success"
        />
      </div>
    </div>
  )
}