'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service, CustomService } from '@/core/types'
import { NotificationModal } from './Modal'

export function ProgressPage() {
  const { state, dispatch } = useApp()
  const { user, selectedServices, services } = state
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service[]>([])
  const [selectedCustomServices, setSelectedCustomServices] = useState<CustomService[]>([])
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

      // Load custom services if user is logged in
      if (user) {
        try {
          const customServicesResponse = await fetch(`/api/custom-services?userId=${user.id}`)
          if (customServicesResponse.ok) {
            const customServicesResult = await customServicesResponse.json()
            const userCustomServices = customServicesResult.customServices || []
            
            // Filter custom services that are selected
            const filteredCustomServices = userCustomServices.filter((customService: CustomService) => 
              selectedServices.includes(customService.id)
            )
            setSelectedCustomServices(filteredCustomServices)
          }
        } catch (error) {
          console.error('Failed to load custom services:', error)
        }
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
      <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-600/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-blue-600/8 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-yellow-400">
              smpl
            </h1>
          </div>
          
          <div className="backdrop-blur-sm bg-slate-900/95 rounded-2xl p-8 shadow-2xl border border-indigo-900/30 ring-1 ring-purple-500/20">
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-lg"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"
                    data-testid="loading-spinner"
                  />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-3">
                Setting up your services
              </h1>
              <p className="text-slate-200 text-base">
                Almost ready...
              </p>
            </div>
          </div>
          
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

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-indigo-500 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-indigo-600/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-sm mx-auto text-center relative z-10 h-full flex flex-col justify-center py-4">
        {/* SMPL Logo */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-3xl font-black text-yellow-400">
            smpl
          </h1>
        </div>
        
        {/* Main celebration container */}
        <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-6 shadow-2xl border border-indigo-900/40 mb-4 ring-1 ring-purple-500/20">
          {/* Celebration visual */}
          <div className="mb-4">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-purple-200/40">
                <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>🌟</span>
              </div>
            </div>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-2">
              You&apos;re all set!
            </h1>
            
            <p className="text-base text-indigo-200 font-medium mb-3">
              You&apos;re tracking
            </p>
            
            {/* Service count */}
            <div className="relative mb-3">
              <div className="text-4xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 bg-clip-text text-transparent mb-1 leading-none">
                {selectedServiceDetails.length + selectedCustomServices.length}
              </div>
              
              <p className="text-lg text-indigo-200 font-semibold">
                {(selectedServiceDetails.length + selectedCustomServices.length) === 1 ? 'service' : 'services'}
              </p>
              <p className="text-sm text-purple-200 font-medium">
                Ready for savings!
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900/80 rounded-lg p-3 border border-indigo-800/40 ring-1 ring-purple-600/20">
              <p className="text-sm text-indigo-100 font-semibold">
                We&apos;re negotiating better rates for your{' '}
                <span className="font-bold text-purple-200">{selectedServiceDetails.length + selectedCustomServices.length} service{(selectedServiceDetails.length + selectedCustomServices.length) !== 1 ? 's' : ''}</span>
              </p>
              <p className="text-xs text-purple-300 mt-1">
                No fees, just savings. We&apos;ll be in touch! 💰
              </p>
            </div>
          </div>
        </div>

        {/* Share section */}
        <div className="bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-indigo-900/30 rounded-2xl p-4 mb-4 border border-indigo-700/30 shadow-lg">
          <div className="text-center">
            <div className="text-2xl mb-2">🌟</div>
            <h3 className="font-bold text-purple-200 mb-2 text-base">Help others save too</h3>
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              More people = stronger negotiating power = <span className="font-semibold text-purple-200">better rates for everyone!</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 flex-shrink-0">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Save Money with SMPL',
                  text: 'Get lower rates on your bills by joining our group. Like Costco, but for monthly services. No fees, just savings.',
                  url: window.location.origin
                })
              } else {
                navigator.clipboard.writeText(window.location.origin)
                setShowShareNotification(true)
              }
            }}
            className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-lg font-semibold py-4 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-purple-500/20 hover:ring-purple-400/40"
          >
            <span className="relative z-10 flex items-center justify-center">
              📤 Share with Friends
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
          </button>
          
          <button
            onClick={handleViewDashboard}
            className="group w-full bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-base font-semibold py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              View My Dashboard
            </span>
          </button>
        </div>
        
        {/* live.smpl Branding */}
        <div className="mt-4 text-center flex-shrink-0">
          <p className="text-xs text-slate-400 font-medium">live.smpl</p>
        </div>
        
        {/* Share Notification Modal */}
        <NotificationModal
          isOpen={showShareNotification}
          onClose={() => setShowShareNotification(false)}
          title="Link Copied!"
          message="Share this link to help others save money on their bills too!"
          type="success"
        />
      </div>
    </div>
  )
}