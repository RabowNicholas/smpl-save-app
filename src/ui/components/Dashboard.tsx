'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { Service } from '@/core/types'
import { ConfirmModal, NotificationModal } from './Modal'
import { LoadingSpinner } from './LoadingSpinner'

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

export function Dashboard() {
  const { state, dispatch } = useApp()
  const { user, selectedServices, services } = state
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({})
  const [removingServices, setRemovingServices] = useState<Record<string, boolean>>({})
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [serviceToRemove, setServiceToRemove] = useState<string | null>(null)
  const [showShareNotification, setShowShareNotification] = useState(false)
  const [showErrorNotification, setShowErrorNotification] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  // Removed unused handleViewSavings function

  const handleRemoveServiceClick = (serviceId: string) => {
    setServiceToRemove(serviceId)
    setShowRemoveConfirm(true)
  }

  const handleConfirmRemove = async () => {
    if (!user || !serviceToRemove) return
    
    setRemovingServices(prev => ({ ...prev, [serviceToRemove]: true }))
    
    try {
      const response = await fetch(`/api/user-services?userId=${user.id}&serviceId=${serviceToRemove}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove service')
      }
      
      // Update local state
      const updatedServices = selectedServices.filter(id => id !== serviceToRemove)
      dispatch({ type: 'SET_SELECTED_SERVICES', payload: updatedServices })
      
      // Update service details
      setSelectedServiceDetails(prev => prev.filter(service => service.id !== serviceToRemove))
      
      setShowRemoveConfirm(false)
      setServiceToRemove(null)
      
    } catch (error) {
      console.error('Failed to remove service:', error)
      setErrorMessage('Failed to remove service. Please try again.')
      setShowErrorNotification(true)
      setShowRemoveConfirm(false)
    } finally {
      setRemovingServices(prev => ({ ...prev, [serviceToRemove]: false }))
    }
  }

  // Focus on service count rather than costs

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Sage floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-600/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-blue-600/8 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md mx-auto relative z-10">
          {/* SMPL Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
              smpl
            </h1>
          </div>
          
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-indigo-900/40 ring-1 ring-purple-500/20">
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-lg"></div>
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <LoadingSpinner size="xl" />
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-3">
                Discover clarity in your financial choices
              </h1>
              <p className="text-indigo-200 text-lg font-medium mb-4">
                Grow wise together
              </p>
              <p className="text-slate-300 text-base">
                Preparing your wisdom dashboard...
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Sage floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-600/8 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-blue-600/8 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-sm mx-auto text-center relative z-10">
          {/* SMPL Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
              smpl
            </h1>
          </div>
          
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-8 shadow-2xl border border-indigo-900/40 ring-1 ring-purple-500/20 mb-8">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-20 blur-lg"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🌱</span>
              </div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-4">
              Discover clarity in your financial choices
            </h1>
            <p className="text-indigo-200 text-lg font-medium mb-4">
              Grow wise together
            </p>
            
            <p className="text-lg text-slate-300 mb-8">
              Begin your journey to financial wisdom by mindfully selecting your services
            </p>
          </div>
          
          <button
            onClick={handleAddServices}
            className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] ring-2 ring-purple-500/20 hover:ring-purple-400/40"
          >
            <span className="relative z-10">Begin Discovery</span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
          </button>
          
          {/* live.smpl Branding */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-medium">live.smpl</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-900 py-6 sm:py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Sage floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-purple-600/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-blue-600/8 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* SMPL Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 bg-clip-text text-transparent">
            smpl
          </h1>
        </div>
        
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent mb-4">
            Discover clarity in your financial choices
          </h1>
          <p className="text-lg sm:text-xl text-indigo-200 font-medium">
            Grow wise together
          </p>
          
          {/* Community Status Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-950/60 to-purple-950/50 border border-indigo-700/50 rounded-lg px-4 py-2 mt-4 ring-1 ring-purple-600/20">
            <span className="text-lg mr-2">🌟</span>
            <span className="text-sm text-purple-200 font-semibold">WISDOM SEEKER</span>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-12">
          <div className="group relative bg-slate-800/70 backdrop-blur-sm rounded-3xl p-4 sm:p-8 text-center shadow-xl hover:shadow-2xl border border-slate-600/40 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">📱</span>
              </div>
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {selectedServiceDetails.length}
              </div>
              <div className="text-sm font-semibold text-slate-200">Services Tracked</div>
            </div>
          </div>
          
          <div className="group relative bg-slate-800/70 backdrop-blur-sm rounded-3xl p-4 sm:p-8 text-center shadow-xl hover:shadow-2xl border border-slate-600/40 transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-3xl"></div>
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white">✅</span>
              </div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                Aware
              </div>
              <div className="text-sm font-semibold text-slate-200">Financial Clarity</div>
            </div>
          </div>
        </div>

        {/* Enhanced Services List */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-slate-200 bg-clip-text text-transparent mb-2">
              Your Mindful Choices
            </h2>
            <p className="text-slate-200">Understanding your financial patterns</p>
          </div>
          
          <div className="grid gap-4">
            {selectedServiceDetails.map((service, index) => {
              const visualData = SERVICE_VISUAL_MAP[service.name] || { icon: '?', brandColor: '#6B7280' }
              const isRemoving = removingServices[service.id]
              
              return (
                <div
                  key={service.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`group relative bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl border border-slate-600/40 transition-all duration-300 hover:scale-[1.01] animate-in fade-in slide-in-from-left-4 ${isRemoving ? 'opacity-50' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-red-800/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Enhanced Logo System */}
                      <div className="w-12 h-12 mr-4 rounded-xl flex items-center justify-center shadow-lg">
                        {service.logoUrl && !logoErrors[service.id] ? (
                          <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center">
                            <img 
                              src={service.logoUrl} 
                              alt={`${service.name} logo`}
                              className="w-8 h-8 object-contain"
                              onError={() => {
                                setLogoErrors(prev => ({ ...prev, [service.id]: true }))
                              }}
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-full h-full rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: visualData.brandColor }}
                          >
                            <span className={`${visualData.icon.length > 2 ? 'text-xs' : visualData.icon.length > 1 ? 'text-sm' : 'text-lg'} font-black filter drop-shadow-sm`}>
                              {visualData.icon}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-100 text-lg group-hover:text-white transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-sm text-slate-300">Active subscription</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          ✓
                        </div>
                        <div className="text-xs text-slate-300 font-medium">tracked</div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveServiceClick(service.id)}
                        disabled={isRemoving}
                        className="group/btn relative w-11 h-11 bg-red-900/30 hover:bg-red-800/50 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 flex items-center justify-center border border-red-700/30 hover:border-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove service"
                        style={{ minWidth: '44px', minHeight: '44px' }}
                      >
                        {isRemoving ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <svg className="w-4 h-4 transition-transform group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Wisdom Community Education */}
        <div className="mb-8 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-indigo-900/20 rounded-2xl p-6 border border-indigo-700/30">
          <div className="text-center">
            <div className="text-3xl mb-3">🌟</div>
            <h3 className="text-lg font-bold text-indigo-200 mb-3">Together We Transform Our Financial Understanding</h3>
            
            {/* Wisdom messaging */}
            <div className="bg-slate-800/40 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-200 font-semibold mb-2">✨ The Path to Collective Wisdom</p>
              <p className="text-xs text-slate-300">When more people gain financial clarity, we all benefit from shared insights and stronger collective voice.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🤝</div>
                <p className="text-sm text-slate-300"><span className="font-semibold text-indigo-200">Shared Wisdom</span></p>
                <p className="text-xs text-slate-300">Collective understanding</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🌱</div>
                <p className="text-sm text-slate-300"><span className="font-semibold text-purple-200">Growth Together</span></p>
                <p className="text-xs text-slate-300">Mutual transformation</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm text-slate-300"><span className="font-semibold text-blue-200">Clearer Choices</span></p>
                <p className="text-xs text-slate-300">Informed decisions</p>
              </div>
            </div>
            
            {/* Benefits for invitees */}
            <div className="bg-slate-800/40 rounded-lg p-4 mb-4 text-left">
              <h4 className="text-sm font-bold text-indigo-200 mb-2">What others discover when they join:</h4>
              <ul className="text-xs text-slate-200 space-y-1">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Mindful financial tracking & insights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Access to collective wisdom & better choices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Community of conscious financial growth</span>
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-slate-200 leading-relaxed">
              Each person who joins strengthens our collective understanding and creates <span className="font-semibold text-purple-200">better opportunities for all</span>.
            </p>
          </div>
        </div>

        {/* Enhanced Actions with Wisdom Focus */}
        <div className="space-y-4">
          <button
            onClick={() => {
              // Web Share API with fallback
              if (navigator.share) {
                navigator.share({
                  title: 'Discover Financial Wisdom with SMPL',
                  text: 'Join a community focused on mindful financial choices and collective wisdom. Transform your relationship with money together.',
                  url: window.location.origin
                }).catch(() => {
                  // Fallback if share is cancelled - copy to clipboard
                  navigator.clipboard.writeText(window.location.origin)
                  setShowShareNotification(true)
                })
              } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.origin)
                setShowShareNotification(true)
              }
            }}
            className="group relative w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 hover:from-indigo-700 hover:via-purple-600 hover:to-blue-700 text-white text-xl font-semibold py-6 rounded-lg transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-[1.03] active:scale-[0.97] ring-2 ring-purple-500/20 hover:ring-purple-400/40"
          >
            <span className="relative z-10 flex items-center justify-center">
              <span className="text-2xl mr-3">✨</span>
              Share Wisdom
            </span>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 rounded-lg blur opacity-20"></div>
          </button>
          
          <button
            onClick={handleAddServices}
            className="group relative w-full bg-slate-700/50 backdrop-blur-sm hover:bg-slate-700/70 text-slate-300 hover:text-slate-200 text-base font-medium py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-600/30 transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Explore More Services
            </span>
          </button>
        </div>
        
        {/* live.smpl Branding */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 font-medium">live.smpl</p>
        </div>

        {/* Modals */}
        <ConfirmModal
          isOpen={showRemoveConfirm}
          onClose={() => {
            setShowRemoveConfirm(false)
            setServiceToRemove(null)
          }}
          onConfirm={handleConfirmRemove}
          title="Remove Service"
          message={`Are you sure you want to remove ${selectedServiceDetails.find(s => s.id === serviceToRemove)?.name || 'this service'} from your tracked services?`}
          confirmText="Remove"
          cancelText="Keep It"
          isLoading={serviceToRemove ? removingServices[serviceToRemove] : false}
          type="danger"
        />
        
        <NotificationModal
          isOpen={showShareNotification}
          onClose={() => setShowShareNotification(false)}
          title="Link Copied!"
          message="Share this path to financial wisdom with others. Together we create a community of mindful financial growth."
          type="success"
        />
        
        <NotificationModal
          isOpen={showErrorNotification}
          onClose={() => setShowErrorNotification(false)}
          title="Error"
          message={errorMessage}
          type="error"
          autoClose={false}
        />
      </div>
    </div>
  )
}