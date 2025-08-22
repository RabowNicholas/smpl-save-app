'use client'

import { useEffect } from 'react'
import { useApp } from '@/ui/context/AppContext'
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
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load categories')
      }
      
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
      <div className="flex flex-col items-center justify-center py-12">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"
          data-testid="loading-spinner"
        />
        <p className="text-gray-600">Loading categories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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