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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"
            data-testid="loading-spinner"
          />
          <p className="text-gray-600">Loading your services...</p>
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

  // Calculate estimated costs and savings
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

  const potentialSavings = Math.round(totalMonthlyCost * 0.23) // 23% average savings

  const getSavingTip = (serviceName: string) => {
    const tips: Record<string, string> = {
      'Netflix': 'Share with family or downgrade plan',
      'Disney+': 'Bundle with Hulu for better value',
      'Hulu': 'Consider ad-supported tier',
      'Amazon Prime Video': 'Use annual billing for discount',
      'HBO Max': 'Cancel between show seasons',
      'Walmart': 'Compare with local stores',
      'Target': 'Use RedCard for 5% discount',
      'Amazon Fresh': 'Consider pickup orders',
      'Costco': 'Calculate if membership pays off',
      'Verizon': 'Negotiate or switch carriers',
      'AT&T': 'Check for better plan options',
      'T-Mobile': 'Look for promotional rates',
      'Comcast Xfinity': 'Negotiate retention rates',
      'DoorDash': 'Use pickup instead of delivery',
      'Uber Eats': 'Look for subscription discounts',
      'Grubhub': 'Compare delivery fees',
      'Uber': 'Use during off-peak hours',
      'Lyft': 'Consider bike/scooter options',
      'Enterprise Rent-A-Car': 'Book in advance for better rates'
    }
    return tips[serviceName] || 'Look for promotional rates'
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-sm mx-auto text-center">
        {/* Beautiful, focused celebration */}
        <div className="mb-12">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-5xl">💰</span>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            You could save
          </h1>
          
          {/* One big, beautiful number */}
          <div className="text-6xl font-bold text-green-500 mb-2">
            ${potentialSavings}
          </div>
          <p className="text-lg text-gray-600 mb-4">
            every month
          </p>
          
          <p className="text-gray-500 mb-6">
            Based on {selectedServiceDetails.length} services worth ${totalMonthlyCost.toFixed(0)}/month
          </p>
          
          {/* Partnership message */}
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              💡 <strong>Savings coming soon!</strong> We&apos;re building partnerships to get you group deals and exclusive discounts. Thank you for helping us understand your needs.
            </p>
          </div>
        </div>

        {/* One clear action */}
        <div className="space-y-4">
          <button
            onClick={handleBackToServices}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-medium py-4 rounded-2xl transition-colors duration-200 shadow-lg"
          >
            Add More Services
          </button>
          
          <button
            onClick={handleViewDashboard}
            className="w-full text-blue-600 text-lg py-3 hover:text-blue-700 transition-colors"
          >
            View My Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}