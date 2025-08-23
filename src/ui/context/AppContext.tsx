'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { User, Category, Service, UserService } from '@/core/types'

export type AppStep = 'welcome' | 'visual-services' | 'progress' | 'dashboard'

export interface AppState {
  user: User | null
  currentStep: AppStep
  selectedCategory: Category | null
  categories: Category[]
  services: Service[]
  userServices: UserService[]
  selectedServices: string[]
  loading: boolean
  error: string | null
}

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_STEP'; payload: AppStep }
  | { type: 'SET_SELECTED_CATEGORY'; payload: Category | null }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'SET_USER_SERVICES'; payload: UserService[] }
  | { type: 'SET_SELECTED_SERVICES'; payload: string[] }
  | { type: 'TOGGLE_SERVICE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }

const initialState: AppState = {
  user: null,
  currentStep: 'welcome',
  selectedCategory: null,
  categories: [],
  services: [],
  userServices: [],
  selectedServices: [],
  loading: false,
  error: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }
    
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload }
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload }
    
    case 'SET_SERVICES':
      return { ...state, services: action.payload }
    
    case 'SET_USER_SERVICES':
      const serviceIds = action.payload.map(us => us.serviceId)
      return { 
        ...state, 
        userServices: action.payload,
        selectedServices: serviceIds
      }
    
    case 'SET_SELECTED_SERVICES':
      return { ...state, selectedServices: action.payload }
    
    case 'TOGGLE_SERVICE':
      const serviceId = action.payload
      const isSelected = state.selectedServices.includes(serviceId)
      const newSelectedServices = isSelected
        ? state.selectedServices.filter(id => id !== serviceId)
        : [...state.selectedServices, serviceId]
      return { ...state, selectedServices: newSelectedServices }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}