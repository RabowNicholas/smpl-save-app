'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service } from '@/core/types'

// Icon and color mapping for services - database is source of truth for names
const SERVICE_VISUAL_MAP: Record<string, { icon: string; color: string }> = {
  // Streaming
  'Netflix': { icon: '🎬', color: 'bg-red-500' },
  'Disney+': { icon: '🏰', color: 'bg-blue-600' },
  'Hulu': { icon: '📱', color: 'bg-green-400' },
  'Amazon Prime Video': { icon: '📺', color: 'bg-blue-600' },
  'HBO Max': { icon: '👑', color: 'bg-purple-600' },
  'Spotify': { icon: '🎵', color: 'bg-green-500' },
  'Apple Music': { icon: '🎵', color: 'bg-gray-800' },
  'YouTube Premium': { icon: '📺', color: 'bg-red-600' },
  
  // Groceries  
  'Walmart': { icon: '🛒', color: 'bg-blue-600' },
  'Target': { icon: '🎯', color: 'bg-red-500' },
  'Amazon Fresh': { icon: '📦', color: 'bg-orange-500' },
  'Costco': { icon: '🏪', color: 'bg-blue-700' },
  
  // Utilities
  'Verizon': { icon: '📱', color: 'bg-red-500' },
  'AT&T': { icon: '📡', color: 'bg-blue-500' },
  'T-Mobile': { icon: '📱', color: 'bg-pink-500' },
  'Comcast Xfinity': { icon: '🌐', color: 'bg-purple-600' },
  
  // Food Delivery
  'DoorDash': { icon: '🚗', color: 'bg-red-500' },
  'Uber Eats': { icon: '🍔', color: 'bg-green-500' },
  'Grubhub': { icon: '🥡', color: 'bg-orange-500' },
  
  // Transportation
  'Uber': { icon: '🚗', color: 'bg-black' },
  'Lyft': { icon: '🚕', color: 'bg-pink-500' },
  'Enterprise Rent-A-Car': { icon: '🚙', color: 'bg-green-600' },
}

export function VisualServicesPage() {
  const { state, dispatch } = useApp()
  const { user, selectedServices, loading } = state
  const [localSelectedServices, setLocalSelectedServices] = useState<string[]>(selectedServices)
  const [savingChanges, setSavingChanges] = useState(false)
  const [allServices, setAllServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [popularServices, setPopularServices] = useState<Service[]>([])

  useEffect(() => {
    loadAllServices()
  }, [])

  const loadAllServices = async () => {
    setServicesLoading(true)
    try {
      // Load all categories and their services
      const categoriesResponse = await fetch('/api/categories')
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`)
      }
      const categoriesResult = await categoriesResponse.json()
      
      const allServices: Service[] = []
      for (const category of categoriesResult.categories) {
        const servicesResponse = await fetch(`/api/services/${category.id}`)
        if (!servicesResponse.ok) {
          console.error(`Failed to fetch services for category ${category.id}: ${servicesResponse.status} ${servicesResponse.statusText}`)
          continue // Skip this category instead of failing entirely
        }
        const servicesResult = await servicesResponse.json()
        allServices.push(...servicesResult.services)
      }
      
      setAllServices(allServices)
      
      // Create prioritized list of popular services from database
      const popular = getPrioritizedServices(allServices)
      setPopularServices(popular)
      
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setServicesLoading(false)
    }
  }

  const getPrioritizedServices = (services: Service[]): Service[] => {
    // Define priority order based on popularity/recognition
    const priorityNames = [
      // Most recognizable streaming services first
      'Netflix', 'Disney+', 'Hulu', 'Amazon Prime Video', 'HBO Max',
      // Popular groceries/shopping
      'Walmart', 'Target', 'Amazon Fresh', 'Costco',
      // Common utilities
      'Verizon', 'AT&T', 'T-Mobile', 'Comcast Xfinity',
      // Food delivery
      'DoorDash', 'Uber Eats', 'Grubhub',
      // Transportation
      'Uber', 'Lyft', 'Enterprise Rent-A-Car'
    ]
    
    const prioritized: Service[] = []
    const remaining: Service[] = []
    
    // First, add services in priority order
    priorityNames.forEach(name => {
      const service = services.find(s => s.name === name)
      if (service) {
        prioritized.push(service)
      }
    })
    
    // Then add any remaining services that have visual mappings
    services.forEach(service => {
      if (!prioritized.find(p => p.id === service.id) && SERVICE_VISUAL_MAP[service.name]) {
        remaining.push(service)
      }
    })
    
    // Limit to top 20 most popular services for clean UI
    return [...prioritized, ...remaining].slice(0, 20)
  }

  const handleServiceToggle = (serviceName: string) => {
    // Prevent clicks while services are loading
    if (servicesLoading) return
    
    // Find the actual service from our loaded services
    const service = allServices.find(s => s.name === serviceName)
    if (!service) return

    const isSelected = localSelectedServices.includes(service.id)
    
    if (isSelected) {
      setLocalSelectedServices(prev => prev.filter(id => id !== service.id))
    } else {
      setLocalSelectedServices(prev => [...prev, service.id])
    }
  }

  const handleContinue = async () => {
    if (!user) return
    
    setSavingChanges(true)
    
    try {
      // Save all selected services
      for (const serviceId of localSelectedServices) {
        if (!selectedServices.includes(serviceId)) {
          const response = await fetch('/api/user-services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, serviceId })
          })
          if (!response.ok) {
            console.error(`Failed to save service ${serviceId}:`, response.status, response.statusText)
            // Continue with other services instead of failing entirely
          }
        }
      }
      
      // Remove unselected services
      for (const serviceId of selectedServices) {
        if (!localSelectedServices.includes(serviceId)) {
          const response = await fetch(`/api/user-services?userId=${user.id}&serviceId=${serviceId}`, {
            method: 'DELETE'
          })
          if (!response.ok) {
            console.error(`Failed to remove service ${serviceId}:`, response.status, response.statusText)
            // Continue with other services instead of failing entirely
          }
        }
      }
      
      // Update global state
      dispatch({ type: 'SET_SERVICES', payload: allServices })
      dispatch({ type: 'SET_SELECTED_SERVICES', payload: localSelectedServices })
      
      // Navigate to dashboard
      dispatch({ type: 'SET_STEP', payload: 'progress' })
    } catch (error) {
      console.error('Failed to save services:', error)
    } finally {
      setSavingChanges(false)
    }
  }

  const isServiceSelected = (serviceName: string) => {
    const service = allServices.find(s => s.name === serviceName)
    return service ? localSelectedServices.includes(service.id) : false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 py-12 px-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-slate-700/50 mb-6">
            <span className="text-2xl mr-3">🎯</span>
            <span className="text-sm font-medium text-slate-300">Step 2 of 3</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-blue-200 bg-clip-text text-transparent mb-4 leading-tight">
            Which services do you pay for?
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 font-medium">
            {servicesLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-blue-300 border-t-transparent rounded-full mr-2"></div>
                <span className="text-slate-300">Loading services...</span>
              </span>
            ) : (
              'Tap the ones you recognize'
            )}
          </p>
        </div>

        {/* Enhanced visual service grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {popularServices.map((service, index) => {
            const selected = isServiceSelected(service.name)
            const visualData = SERVICE_VISUAL_MAP[service.name] || { icon: '📋', color: 'bg-gradient-to-br from-gray-400 to-gray-500' }
            
            return (
              <button
                key={service.id}
                onClick={() => handleServiceToggle(service.name)}
                disabled={servicesLoading}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`
                  group relative p-5 sm:p-7 rounded-3xl transition-all duration-500 transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-4
                  ${servicesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${selected 
                    ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white shadow-2xl shadow-blue-500/25' 
                    : 'bg-slate-800/70 backdrop-blur-sm text-slate-200 shadow-xl hover:shadow-2xl border border-slate-600/40 hover:bg-slate-700/80'
                  }
                `}
              >
                {/* Selection glow effect */}
                {selected && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500 rounded-3xl blur-lg opacity-30"></div>
                )}
                
                <div className="relative text-center">
                  <div className={`
                    w-18 h-18 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 group-hover:scale-110
                    ${selected 
                      ? 'bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg' 
                      : `${visualData.color} shadow-lg`
                    }
                  `}>
                    <span className="filter drop-shadow-sm">{visualData.icon}</span>
                  </div>
                  
                  <h3 className={`font-semibold text-sm leading-tight transition-colors duration-300 ${
                    selected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}>
                    {service.name}
                  </h3>
                  
                  {/* Selection indicator */}
                  {selected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>


        {/* Enhanced floating continue button */}
        {localSelectedServices.length > 0 && (
          <div className="fixed bottom-4 sm:bottom-8 left-4 right-4 sm:left-6 sm:right-6 text-center z-50">
            <div className="max-w-sm mx-auto">
              {/* Selection count indicator */}
              <div className="mb-3 inline-flex items-center bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-slate-700/50">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium text-slate-200">
                  {localSelectedServices.length} service{localSelectedServices.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <button
                onClick={handleContinue}
                disabled={savingChanges}
                className="group relative w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-700 text-white text-xl font-bold py-5 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {savingChanges ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}