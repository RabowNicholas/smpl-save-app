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

  const handleAddServices = () => {
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
  }

  const handleViewSavings = () => {
    dispatch({ type: 'SET_STEP', payload: 'progress' })
  }

  // Focus on service count rather than costs

  if (loading) {
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
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"
                  data-testid="loading-spinner"
                />
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

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-sm mx-auto text-center relative z-10">
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-10 shadow-2xl border border-slate-700/50 mb-8">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-lg"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl">📊</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-blue-200 bg-clip-text text-transparent mb-4">
              Start tracking your services
            </h1>
            
            <p className="text-lg text-slate-300 mb-8">
              Add services to see your spending and potential savings
            </p>
          </div>
          
          <button
            onClick={handleAddServices}
            className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white text-xl font-semibold py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Add Services</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 py-8 px-6 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-slate-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-slate-700/50 mb-6">
            <span className="text-2xl mr-3">📊</span>
            <span className="text-sm font-medium text-slate-300">Your Dashboard</span>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-blue-200 bg-clip-text text-transparent mb-4">
            Services Dashboard
          </h1>
          <p className="text-xl text-slate-300 font-medium">
            Track your subscriptions and find savings
          </p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="group relative bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl border border-slate-600/40 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">📱</span>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {selectedServiceDetails.length}
              </div>
              <div className="text-sm font-semibold text-slate-300">Services Tracked</div>
            </div>
          </div>
          
          <div className="group relative bg-slate-800/70 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl border border-slate-600/40 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">✅</span>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                Organized
              </div>
              <div className="text-sm font-semibold text-slate-300">All Services</div>
            </div>
          </div>
        </div>

        {/* Enhanced Services List */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-slate-200 bg-clip-text text-transparent mb-2">
              Your Services
            </h2>
            <p className="text-slate-300">Manage your subscriptions</p>
          </div>
          
          <div className="grid gap-4">
            {selectedServiceDetails.map((service, index) => (
              <div
                key={service.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="group relative bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl border border-slate-600/40 transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-blue-800/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center">
                    {service.logoUrl ? (
                      <div className="relative">
                        <img
                          src={service.logoUrl}
                          alt={`${service.name} logo`}
                          className="w-12 h-12 object-contain mr-4 rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const fallback = e.currentTarget.nextElementSibling
                            if (fallback) fallback.classList.remove('hidden')
                          }}
                        />
                        <div className="absolute inset-0 bg-white/20 rounded-lg"></div>
                      </div>
                    ) : null}
                    
                    <div 
                      className={`w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center mr-4 shadow-sm ${service.logoUrl ? 'hidden' : ''}`}
                    >
                      <span className="text-slate-600 text-sm font-bold">
                        {service.name.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-100 text-lg group-hover:text-white transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-slate-400">Active subscription</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      ✓
                    </div>
                    <div className="text-sm text-slate-400 font-medium">tracked</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="space-y-4">
          <button
            onClick={handleViewSavings}
            className="group relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white text-xl font-bold py-6 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center">
              <span className="text-2xl mr-3">📊</span>
              View Your Progress
            </span>
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
          </button>
          
          <button
            onClick={handleAddServices}
            className="group relative w-full bg-slate-700/70 backdrop-blur-sm hover:bg-slate-700/90 text-slate-200 hover:text-white text-lg font-semibold py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl border border-slate-600/40 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              <svg className="w-6 h-6 mr-3 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add More Services
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}