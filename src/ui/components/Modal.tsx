'use client'

import { useEffect } from 'react'
import { ButtonLoading } from './LoadingSpinner'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  type?: 'default' | 'danger' | 'success'
}

export function Modal({ isOpen, onClose, title, children, type = 'default' }: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          headerBg: 'bg-gradient-to-r from-red-900/60 to-slate-900/80',
          borderColor: 'border-red-800/40',
          ringColor: 'ring-red-600/20'
        }
      case 'success':
        return {
          headerBg: 'bg-gradient-to-r from-emerald-900/60 to-slate-900/80',
          borderColor: 'border-emerald-800/40',
          ringColor: 'ring-emerald-600/20'
        }
      default:
        return {
          headerBg: 'bg-gradient-to-r from-orange-900/60 to-slate-900/80',
          borderColor: 'border-orange-800/40',
          ringColor: 'ring-orange-600/20'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className={`backdrop-blur-sm bg-slate-900/95 rounded-2xl shadow-2xl border ${styles.borderColor} ${styles.ringColor} ring-1 overflow-hidden`}>
          {/* Header */}
          <div className={`${styles.headerBg} p-6 border-b ${styles.borderColor}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-700/50 rounded-lg"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  type?: 'default' | 'danger' | 'success'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'danger'
}: ConfirmModalProps) {
  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/25'
      case 'success':
        return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-500/25'
      default:
        return 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-orange-500/25'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
      <div className="space-y-6">
        <p className="text-slate-300 leading-relaxed">
          {message}
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`group flex-1 px-4 py-3 font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${getConfirmButtonStyles()}`}
          >
            <span className="flex items-center justify-center">
              {isLoading ? (
                <ButtonLoading message="Processing..." size="sm" />
              ) : (
                confirmText
              )}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  )
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
  autoClose?: boolean
  autoCloseDelay?: number
}

export function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  autoClose = true,
  autoCloseDelay = 3000
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)
      return () => clearTimeout(timer)
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose])

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '✅'
    }
  }

  const getModalType = () => {
    switch (type) {
      case 'error':
        return 'danger'
      case 'info':
        return 'default'
      default:
        return 'success'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={getModalType()}>
      <div className="text-center space-y-4">
        <div className="text-4xl mb-4">
          {getIcon()}
        </div>
        <p className="text-slate-300 leading-relaxed">
          {message}
        </p>
        {!autoClose && (
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-3 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white font-medium rounded-lg transition-all duration-200"
          >
            Close
          </button>
        )}
      </div>
    </Modal>
  )
}