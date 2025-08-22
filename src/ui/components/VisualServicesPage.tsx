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
      const categoriesResult = await categoriesResponse.json()
      
      const allServices: Service[] = []
      for (const category of categoriesResult.categories) {
        const servicesResponse = await fetch(`/api/services/${category.id}`)
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
          await fetch('/api/user-services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, serviceId })
          })
        }
      }
      
      // Remove unselected services
      for (const serviceId of selectedServices) {
        if (!localSelectedServices.includes(serviceId)) {
          await fetch(`/api/user-services?userId=${user.id}&serviceId=${serviceId}`, {
            method: 'DELETE'
          })
        }
      }
      
      // Update global state
      dispatch({ type: 'SET_SERVICES', payload: allServices })
      localSelectedServices.forEach(serviceId => {
        dispatch({ type: 'TOGGLE_SERVICE', payload: serviceId })
      })
      
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
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Simple header */}
        <div className="text-center mb-16">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Which services do you pay for?
          </h1>
          <p className="text-gray-600 text-lg">
            {servicesLoading ? 'Loading services...' : 'Tap the ones you recognize'}
          </p>
        </div>

        {/* Visual service grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {popularServices.map((service) => {
            const selected = isServiceSelected(service.name)
            const visualData = SERVICE_VISUAL_MAP[service.name] || { icon: '📋', color: 'bg-gray-500' }
            
            return (
              <button
                key={service.id}
                onClick={() => handleServiceToggle(service.name)}
                disabled={servicesLoading}
                className={`
                  p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95
                  ${servicesLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  ${selected 
                    ? 'bg-blue-500 text-white shadow-xl ring-4 ring-blue-200' 
                    : 'bg-white text-gray-700 shadow-sm hover:shadow-lg border border-gray-100'
                  }
                `}
              >
                <div className="text-center">
                  <div className={`
                    w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl
                    ${selected ? 'bg-white/20' : visualData.color}
                  `}>
                    {visualData.icon}
                  </div>
                  <h3 className="font-medium text-sm leading-tight">
                    {service.name}
                  </h3>
                </div>
              </button>
            )
          })}
        </div>


        {/* Continue button */}
        {localSelectedServices.length > 0 && (
          <div className="fixed bottom-8 left-6 right-6 text-center">
            <button
              onClick={handleContinue}
              disabled={savingChanges}
              className="w-full max-w-sm mx-auto bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg disabled:opacity-50 active:scale-95"
            >
              {savingChanges ? 'Saving...' : `Continue (${localSelectedServices.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}