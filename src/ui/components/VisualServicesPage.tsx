'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service, CustomService } from '@/core/types'
import { InlineLoading, ButtonLoading } from './LoadingSpinner'
import { ProgressIndicator } from './ProgressIndicator'

// Enhanced service branding with better icons and brand colors
const SERVICE_VISUAL_MAP: Record<string, { icon: string; brandColor: string }> = {
  // Phone Carriers
  'Verizon': { icon: 'V', brandColor: '#CD040B' },
  'AT&T': { icon: 'AT&T', brandColor: '#00A8E0' },
  'T-Mobile': { icon: 'T', brandColor: '#E20074' },
  'Sprint': { icon: 'S', brandColor: '#FFCD00' },
  'Mint Mobile': { icon: 'M', brandColor: '#74C365' },
  'Cricket': { icon: 'C', brandColor: '#5CB85C' },
  
  // Home Insurance
  'State Farm': { icon: 'SF', brandColor: '#CC2936' },
  'GEICO': { icon: 'G', brandColor: '#006747' },
  'Progressive': { icon: 'P', brandColor: '#0066CC' },
  'Allstate': { icon: 'A', brandColor: '#0033A0' },
  'Liberty Mutual': { icon: 'LM', brandColor: '#FDB515' },
  'Farmers': { icon: 'F', brandColor: '#004225' },
  
  // Auto Insurance (same companies, different branding context)
  // Note: Using slightly different colors to differentiate from home insurance
  
  // Renters Insurance  
  'Lemonade': { icon: 'L', brandColor: '#FF6B6B' },
  'Assurant': { icon: 'AS', brandColor: '#1E3A8A' },
  
  // Internet Providers
  'Comcast Xfinity': { icon: 'X', brandColor: '#7B3F98' },
  'Spectrum': { icon: 'SP', brandColor: '#1BA1E2' },
  'Verizon Fios': { icon: 'VF', brandColor: '#CD040B' },
  'AT&T Internet': { icon: 'ATI', brandColor: '#00A8E0' },
  'Cox': { icon: 'COX', brandColor: '#0066CC' },
  'CenturyLink': { icon: 'CL', brandColor: '#00A651' },
}

export function VisualServicesPage() {
  const { state, dispatch } = useApp()
  const { user, selectedServices } = state
  const [localSelectedServices, setLocalSelectedServices] = useState<string[]>(selectedServices)
  const [savingChanges, setSavingChanges] = useState(false)
  const [allServices, setAllServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  // Removed unused popularServices state
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, Service[]>>({})
  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: string}>>([])
  const [customServices, setCustomServices] = useState<CustomService[]>([])
  const [customServicesByCategory, setCustomServicesByCategory] = useState<Record<string, CustomService[]>>({})
  const [showOtherInputs, setShowOtherInputs] = useState<Record<string, boolean>>({})
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredServicesByCategory, setFilteredServicesByCategory] = useState<Record<string, Service[]>>({})
  const [filteredCustomServicesByCategory, setFilteredCustomServicesByCategory] = useState<Record<string, CustomService[]>>({})

  useEffect(() => {
    loadAllServices()
  }, [])

  // Filter services based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServicesByCategory(servicesByCategory)
      setFilteredCustomServicesByCategory(customServicesByCategory)
    } else {
      const filtered: Record<string, Service[]> = {}
      Object.entries(servicesByCategory).forEach(([categoryId, services]) => {
        const filteredServices = services.filter(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (filteredServices.length > 0) {
          filtered[categoryId] = filteredServices
        }
      })
      setFilteredServicesByCategory(filtered)

      const filteredCustom: Record<string, CustomService[]> = {}
      Object.entries(customServicesByCategory).forEach(([categoryId, customServices]) => {
        const filteredCustomServices = customServices.filter(customService => 
          customService.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (filteredCustomServices.length > 0) {
          filteredCustom[categoryId] = filteredCustomServices
        }
      })
      setFilteredCustomServicesByCategory(filteredCustom)
    }
  }, [searchQuery, servicesByCategory, customServicesByCategory])

  const loadAllServices = async () => {
    setServicesLoading(true)
    try {
      // Load all categories and their services
      const categoriesResponse = await fetch('/api/categories')
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to fetch categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`)
      }
      const categoriesResult = await categoriesResponse.json()
      setCategories(categoriesResult.categories)
      
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
      // Note: popular services functionality available but not currently used
      // const popular = getPrioritizedServices(allServices)
      
      // Group services by category for organized display
      const grouped = categoriesResult.categories.reduce((acc: Record<string, Service[]>, category: {id: string, name: string, icon: string}) => {
        const categoryServices = allServices.filter(service => service.categoryId === category.id)
        acc[category.id] = categoryServices
        return acc
      }, {})
      setServicesByCategory(grouped)

      // Load user's custom services if user is logged in
      if (user) {
        try {
          const customServicesResponse = await fetch(`/api/custom-services?userId=${user.id}`)
          if (customServicesResponse.ok) {
            const customServicesResult = await customServicesResponse.json()
            const userCustomServices = customServicesResult.customServices || []
            setCustomServices(userCustomServices)

            // Group custom services by category
            const groupedCustomServices = categoriesResult.categories.reduce((acc: Record<string, CustomService[]>, category: {id: string, name: string, icon: string}) => {
              const categoryCustomServices = userCustomServices.filter((customService: CustomService) => customService.categoryId === category.id)
              acc[category.id] = categoryCustomServices
              return acc
            }, {})
            setCustomServicesByCategory(groupedCustomServices)
          }
        } catch (error) {
          console.error('Failed to load custom services:', error)
        }
      }
      
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setServicesLoading(false)
    }
  }

  // getPrioritizedServices function available for future use if needed
  // Currently unused but kept for potential popular services feature

  const handleServiceToggle = (serviceId: string) => {
    // Prevent clicks while services are loading
    if (servicesLoading) return
    
    const isSelected = localSelectedServices.includes(serviceId)
    
    if (isSelected) {
      setLocalSelectedServices(prev => prev.filter(id => id !== serviceId))
    } else {
      setLocalSelectedServices(prev => [...prev, serviceId])
    }
  }

  const handleContinue = async () => {
    if (!user) return
    
    setSavingChanges(true)
    
    try {
      // Separate regular services from custom services
      const customServiceIds = customServices.map(cs => cs.id)
      
      // Save selected regular services
      for (const serviceId of localSelectedServices) {
        if (!customServiceIds.includes(serviceId) && !selectedServices.includes(serviceId)) {
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

      // Custom services are already saved when created via handleCustomServiceAdd
      // Just need to handle deselection of custom services
      
      // Remove unselected regular services
      for (const serviceId of selectedServices) {
        if (!customServiceIds.includes(serviceId) && !localSelectedServices.includes(serviceId)) {
          const response = await fetch(`/api/user-services?userId=${user.id}&serviceId=${serviceId}`, {
            method: 'DELETE'
          })
          if (!response.ok) {
            console.error(`Failed to remove service ${serviceId}:`, response.status, response.statusText)
            // Continue with other services instead of failing entirely
          }
        }
      }

      // Remove unselected custom services
      for (const customService of customServices) {
        if (!localSelectedServices.includes(customService.id)) {
          const response = await fetch(`/api/custom-services?userId=${user.id}&customServiceId=${customService.id}`, {
            method: 'DELETE'
          })
          if (!response.ok) {
            console.error(`Failed to remove custom service ${customService.id}:`, response.status, response.statusText)
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

  const isServiceSelected = (serviceId: string) => {
    return localSelectedServices.includes(serviceId)
  }

  const handleCustomServiceAdd = async (categoryId: string, serviceName: string) => {
    if (!serviceName.trim() || !user) return
    
    try {
      const response = await fetch('/api/custom-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: serviceName.trim(),
          categoryId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create custom service')
      }

      const result = await response.json()
      const newCustomService = result.customService

      // Add to local custom services state
      setCustomServices(prev => [...prev, newCustomService])

      // Update custom services by category
      setCustomServicesByCategory(prev => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), newCustomService]
      }))

      // Add to selected services
      setLocalSelectedServices(prev => [...prev, newCustomService.id])
      
      // Hide the input and clear it
      setShowOtherInputs(prev => ({ ...prev, [categoryId]: false }))
    } catch (error) {
      console.error('Failed to add custom service:', error)
      // You could add error handling UI here
    }
  }

  const handleOtherInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, categoryId: string) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget
      handleCustomServiceAdd(categoryId, input.value)
      input.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 py-12 px-6 relative overflow-hidden">
      {/* Sage floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-blue-600/8 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* SMPL Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-yellow-400">
            smpl
          </h1>
        </div>
        
        {/* Progress indicator */}
        <ProgressIndicator 
          currentStep={2}
          totalSteps={3}
          steps={['Sign Up', 'Select Services', 'Track & Save']}
        />
        
        {/* Enhanced header */}
        <div className="text-center mb-16">
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-4 leading-tight">
            Select your services
          </h1>
          <p className="text-indigo-200 text-lg font-medium mb-4">
            Choose the services you want to save money on
          </p>
          <p className="text-lg sm:text-xl text-slate-200 font-medium">
            {servicesLoading ? (
              <InlineLoading message="Loading your options..." size="md" color="indigo" />
            ) : (
              'We\'ll help you get better rates on these services'
            )}
          </p>
        </div>

        {/* Search functionality - only show when not loading */}
        {!servicesLoading && (
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full px-6 py-4 bg-slate-800/70 border border-slate-600/40 rounded-2xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400/50 transition-all duration-300 pr-12"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-300">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-slate-300 transition-colors duration-200 p-2"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
            {searchQuery && (
              <div className="mt-2 text-center">
                <span className="text-sm text-slate-300">
                  {Object.values(filteredServicesByCategory).flat().length + Object.values(filteredCustomServicesByCategory).flat().length} service{(Object.values(filteredServicesByCategory).flat().length + Object.values(filteredCustomServicesByCategory).flat().length) !== 1 ? 's' : ''} found
                </span>
              </div>
            )}
          </div>
        )}

        {/* Category-based service organization */}
        <div className="space-y-8 mb-12">
          {Object.entries(filteredServicesByCategory).map(([categoryId, services]) => {
            const category = categories.find(cat => cat.id === categoryId)
            const categoryName = category?.name || 'Services'
            const categoryEmoji = category?.icon || '📋'
            
            return (
              <div key={categoryId} className="animate-in fade-in slide-in-from-bottom-4">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">{categoryEmoji}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-200">{categoryName}</h3>
                      <p className="text-sm text-slate-300">Select your {categoryName.toLowerCase()} services</p>
                    </div>
                  </div>
                  
                  {/* Other Service Button */}
                  <button
                    onClick={() => setShowOtherInputs(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))}
                    className="group flex items-center space-x-2 px-4 py-3 bg-slate-700/70 hover:bg-slate-600/70 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all duration-300 border border-slate-600/40"
                    style={{ minHeight: '44px' }}
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Other</span>
                  </button>
                </div>
                
                {/* Other Service Input */}
                {showOtherInputs[categoryId] && (
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder={`Add a ${categoryName.toLowerCase()} service...`}
                        onKeyPress={(e) => handleOtherInputKeyPress(e, categoryId)}
                        className="flex-1 px-4 py-3 bg-slate-700/70 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all duration-300"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="Add a"]') as HTMLInputElement
                          if (input) {
                            handleCustomServiceAdd(categoryId, input.value)
                            input.value = ''
                          }
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Services Grid for this category */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {services.map((service, index) => {
                    const selected = isServiceSelected(service.id)
                    const visualData = SERVICE_VISUAL_MAP[service.name] || { icon: '?', brandColor: '#6B7280' }
                    
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleServiceToggle(service.id)}
                        disabled={servicesLoading}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`
                          group relative p-4 sm:p-6 rounded-2xl transition-all duration-500 transform hover:scale-105 active:scale-95
                          ${servicesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          ${selected 
                            ? 'bg-gradient-to-br from-indigo-600 via-purple-500 to-blue-600 text-white shadow-xl shadow-purple-500/25' 
                            : 'bg-slate-800/70 backdrop-blur-sm text-slate-200 shadow-lg hover:shadow-xl border border-slate-600/40 hover:bg-slate-700/80'
                          }
                        `}
                      >
                        {/* Selection glow effect */}
                        {selected && (
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-2xl blur-lg opacity-30"></div>
                        )}
                        
                        <div className="relative text-center">
                          <div 
                            className={`
                              w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg
                              ${selected 
                                ? 'bg-white/20 backdrop-blur-sm border border-white/30' 
                                : 'bg-white'
                              }
                            `}
                          >
                            {service.logoUrl && !logoErrors[service.id] ? (
                              <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                                <img 
                                  src={service.logoUrl} 
                                  alt={`${service.name} logo`}
                                  className="w-full h-full object-contain"
                                  style={{ 
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                  }}
                                  onError={() => {
                                    // Mark this logo as failed and trigger re-render
                                    setLogoErrors(prev => ({ ...prev, [service.id]: true }))
                                  }}
                                />
                              </div>
                            ) : (
                              <div 
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg"
                                style={{ 
                                  backgroundColor: selected ? 'rgba(255,255,255,0.2)' : visualData.brandColor,
                                  backdropFilter: selected ? 'blur(4px)' : 'none'
                                }}
                              >
                                <span 
                                  className={`${visualData.icon.length > 2 ? 'text-xs' : visualData.icon.length > 1 ? 'text-sm' : 'text-lg sm:text-xl'} font-black filter drop-shadow-sm text-white`}
                                >
                                  {visualData.icon}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className={`font-semibold text-xs sm:text-sm leading-tight transition-colors duration-300 ${
                            selected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {service.name}
                          </h3>
                          
                          {/* Selection indicator */}
                          {selected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                  
                  {/* Custom Services for this category */}
                  {(filteredCustomServicesByCategory[categoryId] || []).map((customService) => {
                      const selected = localSelectedServices.includes(customService.id)
                      return (
                        <div
                          key={customService.id}
                          className={`
                            group relative p-4 sm:p-6 rounded-2xl transition-all duration-500
                            ${selected 
                              ? 'bg-gradient-to-br from-indigo-600 via-purple-500 to-blue-600 text-white shadow-xl shadow-purple-500/25' 
                              : 'bg-slate-800/70 backdrop-blur-sm text-slate-200 shadow-lg border border-slate-600/40'
                            }
                          `}
                        >
                          <div className="relative text-center">
                            <div className={`
                              w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-xl sm:text-2xl
                              ${selected 
                                ? 'bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg' 
                                : 'bg-emerald-600 shadow-lg'
                              }
                            `}>
                              <span className="filter drop-shadow-sm">✨</span>
                            </div>
                            
                            <h3 className={`font-semibold text-xs sm:text-sm leading-tight ${
                              selected ? 'text-white' : 'text-slate-200'
                            }`}>
                              {customService.name}
                            </h3>
                            
                            {/* Selection indicator */}
                            {selected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
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
                className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-6 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:transform-none ring-2 ring-purple-500/20 hover:ring-purple-400/40"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {savingChanges ? (
                    <ButtonLoading message="Saving..." size="md" />
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
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
              </button>
            </div>
          </div>
        )}
        
        {/* live.smpl Branding */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 font-medium">live.smpl</p>
        </div>
      </div>
    </div>
  )
}