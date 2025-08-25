'use client'

import { useState, useMemo } from 'react'
import { Service } from '@/core/types'

export interface ServiceSelectorProps {
  services: Service[]
  selectedServices: string[]
  onServiceToggle: (serviceId: string, selected: boolean) => void
  onSearch?: (searchTerm: string) => void
  searchTerm?: string
  loading: boolean
  error?: string
  onRetry?: () => void
}

export function ServiceSelector({
  services,
  selectedServices,
  onServiceToggle,
  onSearch,
  searchTerm = '',
  loading,
  error,
  onRetry,
}: ServiceSelectorProps) {
  const [announcement, setAnnouncement] = useState('')

  // Sort services: featured first, then alphabetical
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      // Featured services first
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1
      }
      // Then alphabetical - but keep original order if both featured
      return a.name.localeCompare(b.name)
    })
  }, [services])

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm) return sortedServices
    return sortedServices.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sortedServices, searchTerm])

  const handleServiceClick = (service: Service) => {
    const isSelected = selectedServices.includes(service.id)
    const newSelected = !isSelected
    
    onServiceToggle(service.id, newSelected)
    
    // Announce change to screen readers
    setAnnouncement(
      newSelected 
        ? `${service.name} selected` 
        : `${service.name} deselected`
    )
    
    // Clear announcement after short delay
    setTimeout(() => setAnnouncement(''), 1000)
  }

  const handleKeyDown = (event: React.KeyboardEvent, service: Service) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleServiceClick(service)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onSearch?.(value)
  }

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
                Loading services...
              </h3>
              <p className="text-slate-300">Finding your options</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{ minHeight: '44px' }}
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (!loading && filteredServices.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No services found for &quot;{searchTerm}&quot;</p>
      </div>
    )
  }

  if (!loading && services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No services available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Search Input */}
      {onSearch && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="sr-announcement"
      >
        {announcement}
      </div>

      {/* Services Grid */}
      <div
        role="grid"
        aria-label="Service selection"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {filteredServices.map((service) => {
          const isSelected = selectedServices.includes(service.id)
          
          return (
            <div
              key={service.id}
              role="gridcell"
              data-testid={`service-card-${service.id}`}
              tabIndex={0}
              aria-selected={isSelected}
              className={`
                relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 
                focus:ring-2 focus:ring-blue-500 focus:outline-none
                hover:shadow-md hover:scale-[1.02]
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 selected'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => handleServiceClick(service)}
              onKeyDown={(e) => handleKeyDown(e, service)}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div 
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                  data-testid={`check-icon-${service.id}`}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Service Logo */}
              <div className="flex items-center justify-center mb-3">
                {service.logoUrl ? (
                  <img
                    src={service.logoUrl}
                    alt={`${service.name} logo`}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      // Hide image on error and show fallback
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling
                      if (fallback) fallback.classList.remove('hidden')
                    }}
                  />
                ) : null}
                
                {/* Fallback logo */}
                <div 
                  className={`w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center ${service.logoUrl ? 'hidden' : ''}`}
                  data-testid={`fallback-logo-${service.id}`}
                >
                  <span className="text-gray-500 text-xs font-medium">
                    {service.name.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Service Name */}
              <h3 className="text-sm font-medium text-gray-900 text-center mb-2">
                {service.name}
              </h3>

              {/* Featured Badge */}
              {service.isFeatured && (
                <div className="absolute top-2 left-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    Popular
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}