import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/core/services/AuthService'
import { AuthProvider } from '@/core/types'

// Mock auth provider
const mockAuthProvider: AuthProvider = {
  sendVerificationCode: vi.fn(),
  verifyCode: vi.fn(),
}

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService(mockAuthProvider)
  })

  describe('sendVerificationCode', () => {
    it('should send verification code for valid phone number', async () => {
      const phone = '+1234567890'
      
      await authService.sendVerificationCode(phone)
      
      expect(mockAuthProvider.sendVerificationCode).toHaveBeenCalledWith(phone)
    })

    it('should reject invalid phone number format', async () => {
      const invalidPhone = '1234567890' // no +
      
      await expect(authService.sendVerificationCode(invalidPhone))
        .rejects.toThrow('Invalid phone number format')
        
      expect(mockAuthProvider.sendVerificationCode).not.toHaveBeenCalled()
    })

    it('should handle rate limiting', async () => {
      const phone = '+1234567890'
      
      // Send first code
      await authService.sendVerificationCode(phone)
      
      // Try to send again immediately - should be rate limited
      await expect(authService.sendVerificationCode(phone))
        .rejects.toThrow('Rate limit exceeded. Please wait before requesting another code.')
    })

    it('should allow resend after rate limit period', async () => {
      const phone = '+1234567890'
      
      // Send first code
      await authService.sendVerificationCode(phone)
      
      // Mock time passage (60 seconds)
      vi.useFakeTimers()
      vi.advanceTimersByTime(60 * 1000)
      
      // Should allow resend now
      await expect(authService.sendVerificationCode(phone))
        .resolves.not.toThrow()
        
      expect(mockAuthProvider.sendVerificationCode).toHaveBeenCalledTimes(2)
      
      vi.useRealTimers()
    })
  })

  describe('verifyCode', () => {
    it('should verify valid code and return user', async () => {
      const phone = '+1234567890'
      const code = '123456'
      const mockUser = {
        id: 'user-1',
        phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockAuthProvider.verifyCode).mockResolvedValue(mockUser)
      
      const result = await authService.verifyCode(phone, code)
      
      expect(result).toEqual(mockUser)
      expect(mockAuthProvider.verifyCode).toHaveBeenCalledWith(phone, code)
    })

    it('should reject invalid phone number', async () => {
      const invalidPhone = '1234567890'
      const code = '123456'
      
      await expect(authService.verifyCode(invalidPhone, code))
        .rejects.toThrow('Invalid phone number format')
        
      expect(mockAuthProvider.verifyCode).not.toHaveBeenCalled()
    })

    it('should reject invalid code format', async () => {
      const phone = '+1234567890'
      const invalidCodes = ['123', '12345678', 'abcdef', '']
      
      for (const code of invalidCodes) {
        await expect(authService.verifyCode(phone, code))
          .rejects.toThrow('Invalid verification code format')
      }
      
      expect(mockAuthProvider.verifyCode).not.toHaveBeenCalled()
    })

    it('should handle verification provider errors', async () => {
      const phone = '+1234567890'
      const code = '123456'
      
      vi.mocked(mockAuthProvider.verifyCode)
        .mockRejectedValue(new Error('Invalid verification code'))
      
      await expect(authService.verifyCode(phone, code))
        .rejects.toThrow('Invalid verification code')
    })

    it('should clear rate limit after successful verification', async () => {
      const phone = '+1234567890'
      const code = '123456'
      const mockUser = {
        id: 'user-1',
        phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Send verification code first
      await authService.sendVerificationCode(phone)
      
      vi.mocked(mockAuthProvider.verifyCode).mockResolvedValue(mockUser)
      
      // Verify the code
      await authService.verifyCode(phone, code)
      
      // Should be able to send new code immediately after successful verification
      await expect(authService.sendVerificationCode(phone))
        .resolves.not.toThrow()
    })
  })

  describe('isValidVerificationCode', () => {
    it('should validate 6-digit numeric codes', () => {
      const validCodes = ['123456', '000000', '999999']
      
      for (const code of validCodes) {
        expect(authService.isValidVerificationCode(code)).toBe(true)
      }
    })

    it('should reject invalid code formats', () => {
      const invalidCodes = ['123', '12345', '1234567', 'abcdef', '12345a', '']
      
      for (const code of invalidCodes) {
        expect(authService.isValidVerificationCode(code)).toBe(false)
      }
    })
  })
})