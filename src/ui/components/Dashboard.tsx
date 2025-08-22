'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service } from '@/core/types'

export function Dashboard() {
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
        const allCategories = await fetch('/api/categories').then(r => r.json())
        const allServices: Service[] = []
        
        for (const category of allCategories.categories) {
          const categoryServices = await fetch(`/api/services/${category.id}`).then(r => r.json())
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

  const handleAddServices = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
  }

  const handleViewSavings = () => {
    dispatch({ type: 'SET_STEP', payload: 'progress' })
  }

  // Calculate estimated costs
  const getServiceCost = (serviceName: string) => {
    const costs: Record<string, number> = {
      'Netflix': 15.49,
      'Disney+': 7.99,
      'Hulu': 7.99,
      'Amazon Prime Video': 8.99,
      'HBO Max': 14.99,
      'Walmart': 98,
      'Target': 45,
      'Amazon Fresh': 67,
      'Costco': 120,
      'Verizon': 80,
      'AT&T': 75,
      'T-Mobile': 70,
      'Comcast Xfinity': 89,
      'DoorDash': 9.99,
      'Uber Eats': 12.99,
      'Grubhub': 9.99,
      'Uber': 25,
      'Lyft': 23,
      'Enterprise Rent-A-Car': 45
    }
    return costs[serviceName] || 19.99
  }

  const totalMonthlyCost = selectedServiceDetails.reduce((sum, service) => 
    sum + getServiceCost(service.name), 0
  )

  const potentialSavings = Math.round(totalMonthlyCost * 0.23)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"
            data-testid="loading-spinner"
          />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">📊</span>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Start tracking your services
          </h1>
          
          <p className="text-gray-600 mb-8">
            Add services to see your spending and potential savings
          </p>
          
          <button
            onClick={handleAddServices}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-4 rounded-2xl transition-colors duration-200 shadow-lg"
          >
            Add Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Your Services Dashboard
          </h1>
          <p className="text-gray-600">
            Track your subscriptions and find savings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {selectedServiceDetails.length}
            </div>
            <div className="text-sm text-blue-700">Services Tracked</div>
          </div>
          
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${totalMonthlyCost.toFixed(0)}
            </div>
            <div className="text-sm text-green-700">Monthly Cost</div>
          </div>
        </div>

        {/* Services List */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Services
          </h2>
          
          <div className="space-y-3">
            {selectedServiceDetails.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center">
                  {service.logoUrl ? (
                    <img
                      src={service.logoUrl}
                      alt={`${service.name} logo`}
                      className="w-10 h-10 object-contain mr-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        const fallback = e.currentTarget.nextElementSibling
                        if (fallback) fallback.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  
                  <div 
                    className={`w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3 ${service.logoUrl ? 'hidden' : ''}`}
                  >
                    <span className="text-gray-500 text-xs font-medium">
                      {service.name.charAt(0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ${getServiceCost(service.name)}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleViewSavings}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-medium py-4 rounded-2xl transition-colors duration-200 shadow-lg"
          >
            View Savings Potential (${potentialSavings}/mo)
          </button>
          
          <button
            onClick={handleAddServices}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-4 rounded-2xl transition-colors duration-200 shadow-lg"
          >
            Add More Services
          </button>
        </div>
      </div>
    </div>
  )
}