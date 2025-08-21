import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthPage } from '@/ui/components/AuthPage'

describe('AuthPage', () => {
  const mockOnPhoneSubmit = vi.fn()
  const mockOnCodeSubmit = vi.fn()
  const mockOnBack = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Phone Number Step', () => {
    it('should render phone number input form', () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      expect(screen.getByText('Sign in with your phone')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone number')).toBeInTheDocument()
      expect(screen.getByText('Send verification code')).toBeInTheDocument()
    })

    it('should format phone number as user types', async () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const phoneInput = screen.getByLabelText('Phone number')
      
      await user.type(phoneInput, '1234567890')
      expect(phoneInput).toHaveValue('(123) 456-7890')
    })

    it('should validate phone number before submission', async () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const submitButton = screen.getByText('Send verification code')
      await user.click(submitButton)

      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      expect(mockOnPhoneSubmit).not.toHaveBeenCalled()
    })

    it('should submit valid phone number', async () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const phoneInput = screen.getByLabelText('Phone number')
      const submitButton = screen.getByText('Send verification code')

      await user.type(phoneInput, '1234567890')
      await user.click(submitButton)

      expect(mockOnPhoneSubmit).toHaveBeenCalledWith('+11234567890')
    })

    it('should show loading state during submission', () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={true}
        />
      )

      expect(screen.getByText('Sending...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should display error message when provided', () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
          error="Invalid phone number format"
        />
      )

      expect(screen.getByText('Invalid phone number format')).toBeInTheDocument()
    })
  })

  describe('Verification Code Step', () => {
    it('should render verification code input form', () => {
      render(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          onBack={mockOnBack}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      expect(screen.getByText('Enter verification code')).toBeInTheDocument()
      expect(screen.getByText('We sent a code to (123) 456-7890')).toBeInTheDocument()
      expect(screen.getByLabelText('Verification code')).toBeInTheDocument()
      expect(screen.getByText('Verify')).toBeInTheDocument()
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('should only allow numeric input', async () => {
      render(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      const codeInput = screen.getByLabelText('Verification code')
      
      await user.type(codeInput, 'abc123')
      expect(codeInput).toHaveValue('123')
    })

    it('should validate verification code length', async () => {
      render(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      const submitButton = screen.getByText('Verify')
      await user.click(submitButton)

      expect(screen.getByText('Please enter a 6-digit verification code')).toBeInTheDocument()
      expect(mockOnCodeSubmit).not.toHaveBeenCalled()
    })

    it('should submit valid verification code', async () => {
      render(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      const codeInput = screen.getByLabelText('Verification code')
      const submitButton = screen.getByText('Verify')

      await user.type(codeInput, '123456')
      await user.click(submitButton)

      expect(mockOnCodeSubmit).toHaveBeenCalledWith('+11234567890', '123456')
    })

    it('should call onBack when back button is clicked', async () => {
      render(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          onBack={mockOnBack}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      const backButton = screen.getByText('Back')
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalled()
    })

    it('should auto-focus code input when step changes to code', () => {
      const { rerender } = render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      rerender(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      const codeInput = screen.getByLabelText('Verification code')
      expect(codeInput).toHaveFocus()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should submit phone form on Enter key', async () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const phoneInput = screen.getByLabelText('Phone number')
      await user.type(phoneInput, '1234567890')
      await user.keyboard('{Enter}')

      expect(mockOnPhoneSubmit).toHaveBeenCalledWith('+11234567890')
    })

    it('should submit code form on Enter key', async () => {
      render(
        <AuthPage
          step="code"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          phoneNumber="+11234567890"
          loading={false}
        />
      )

      const codeInput = screen.getByLabelText('Verification code')
      await user.type(codeInput, '123456')
      await user.keyboard('{Enter}')

      expect(mockOnCodeSubmit).toHaveBeenCalledWith('+11234567890', '123456')
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const phoneInput = screen.getByLabelText('Phone number')
      expect(phoneInput).toHaveAttribute('type', 'tel')
      expect(phoneInput).toHaveAttribute('aria-required', 'true')
      expect(phoneInput).toHaveAttribute('aria-describedby', 'phone-help')
    })

    it('should announce errors to screen readers', () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
          error="Network error"
        />
      )

      const errorElement = screen.getByText('Network error')
      expect(errorElement).toHaveAttribute('role', 'alert')
      expect(errorElement).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper heading hierarchy', () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sign in with your phone')
    })
  })

  describe('Phone Number Formatting', () => {
    it('should handle international numbers', async () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const phoneInput = screen.getByLabelText('Phone number')
      
      // Test UK number
      await user.clear(phoneInput)
      await user.type(phoneInput, '+447777777777')
      
      const submitButton = screen.getByText('Send verification code')
      await user.click(submitButton)

      expect(mockOnPhoneSubmit).toHaveBeenCalledWith('+447777777777')
    })

    it('should strip non-numeric characters except plus', async () => {
      render(
        <AuthPage
          step="phone"
          onPhoneSubmit={mockOnPhoneSubmit}
          onCodeSubmit={mockOnCodeSubmit}
          loading={false}
        />
      )

      const phoneInput = screen.getByLabelText('Phone number')
      
      await user.type(phoneInput, '(123) 456-7890')
      expect(phoneInput).toHaveValue('(123) 456-7890')
    })
  })
})