import { AuthProvider, User } from '@/core/types'
import { validatePhoneNumber } from '@/core/entities/User'

export class AuthService {
  private readonly rateLimitMap: Map<string, number> = new Map()
  private readonly RATE_LIMIT_DURATION = 60 * 1000 // 60 seconds in milliseconds

  constructor(private readonly authProvider: AuthProvider) {}

  async sendVerificationCode(phone: string): Promise<void> {
    if (!validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    // Check rate limiting
    const lastSent = this.rateLimitMap.get(phone)
    if (lastSent && Date.now() - lastSent < this.RATE_LIMIT_DURATION) {
      throw new Error('Rate limit exceeded. Please wait before requesting another code.')
    }

    // Send the verification code via provider
    await this.authProvider.sendVerificationCode(phone)

    // Update rate limit tracking
    this.rateLimitMap.set(phone, Date.now())
  }

  async verifyCode(phone: string, code: string): Promise<User> {
    if (!validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    if (!this.isValidVerificationCode(code)) {
      throw new Error('Invalid verification code format')
    }

    try {
      const user = await this.authProvider.verifyCode(phone, code)
      
      // Clear rate limit after successful verification
      this.rateLimitMap.delete(phone)
      
      return user
    } catch (error) {
      // Re-throw provider errors
      throw error
    }
  }

  isValidVerificationCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false
    }

    // Must be exactly 6 digits
    const codeRegex = /^\d{6}$/
    return codeRegex.test(code)
  }
}