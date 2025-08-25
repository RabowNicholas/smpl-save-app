'use client'

import { useEffect } from 'react'
import { useApp } from '@/ui/context/AppContext'
import { LoadingSpinner } from './LoadingSpinner'
import { Category } from '@/core/types'
import { ProgressIndicator } from './ProgressIndicator'

export function CategoriesPage() {
  const { state, dispatch } = useApp()
  const { categories, loading, error } = state

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'CLEAR_ERROR' })
    
    try {
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        let errorMessage = 'Failed to load categories'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
      dispatch({ type: 'SET_CATEGORIES', payload: result.categories })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleCategorySelect = (category: Category) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category })
    dispatch({ type: 'SET_STEP', payload: 'visual-services' })
  }

  const handleRetry = () => {
    loadCategories()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-black flex items-center justify-center px-6 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-red-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-sm mx-auto text-center relative z-10">
          <div className="backdrop-blur-sm bg-slate-800/90 rounded-3xl p-10 shadow-2xl border border-slate-700/50">
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <LoadingSpinner size="xl" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-200 to-red-200 bg-clip-text text-transparent mb-2">
                Loading categories...
              </h3>
              <p className="text-slate-300">Preparing your options</p>
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
        <button
          onClick={handleRetry}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          style={{ minHeight: '44px' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <ProgressIndicator 
          currentStep={1}
          totalSteps={3}
          steps={['Categories', 'Services', 'Savings Dashboard']}
        />
        
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">💰</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Which services are costing you money?
            </h1>
            <p className="text-gray-600 mb-2">
              Let&apos;s start by exploring the categories where you spend the most.
            </p>
            <p className="text-sm text-blue-600 font-medium">
              Average savings: $15-30 per category
            </p>
          </div>
        
        <div className="space-y-4">
          {categories.map((category) => (
            <div 
              key={category.id}
              data-testid={`category-${category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => handleCategorySelect(category)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getCategoryDescription(category.name)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryDescription(categoryName: string): string {
  const descriptions: Record<string, string> = {
    'Streaming & Entertainment': 'Avg. $47/month • Often have unused services',
    'Groceries': 'Avg. $89/month • Check for duplicate memberships',
    'Internet / Phone Provider': 'Avg. $94/month • High savings potential',
    'Food Delivery': 'Avg. $52/month • Easy to overspend here',
    'Transportation': 'Avg. $73/month • Multiple overlapping apps'
  }
  return descriptions[categoryName] || 'Track spending in this category'
}