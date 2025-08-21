import twilio from 'twilio'
import { AuthProvider, User, DatabaseClient } from '@/core/types'
import { validatePhoneNumber } from '@/core/entities/User'

export class TwilioAuthProvider implements AuthProvider {
  private client: twilio.Twilio

  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly verifyServiceSid: string,
    private readonly databaseClient: DatabaseClient
  ) {
    this.client = twilio(accountSid, authToken)
  }

  async sendVerificationCode(phone: string): Promise<void> {
    if (!validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    try {
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: phone,
          channel: 'sms',
        })

      if (verification.status !== 'pending') {
        throw new Error('Failed to initiate verification')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send verification code: ${error.message}`)
      }
      throw error
    }
  }

  async verifyCode(phone: string, code: string): Promise<User> {
    if (!validatePhoneNumber(phone)) {
      throw new Error('Invalid phone number format')
    }

    if (!this.isValidCode(code)) {
      throw new Error('Invalid verification code format')
    }

    try {
      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: phone,
          code,
        })

      if (!this.isValidVerificationStatus(verificationCheck.status)) {
        throw new Error('Invalid verification code')
      }

      // Try to get existing user
      let user = await this.databaseClient.getUserByPhone(phone)

      // Create new user if doesn't exist
      if (!user) {
        try {
          user = await this.databaseClient.createUser(phone)
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Failed to create user: ${error.message}`)
          }
          throw error
        }
      }

      return user
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw our custom errors
        if (error.message.includes('Invalid verification code') || 
            error.message.includes('Failed to create user')) {
          throw error
        }
        throw new Error(`Failed to verify code: ${error.message}`)
      }
      throw error
    }
  }

  isValidVerificationStatus(status: string): boolean {
    return status === 'approved'
  }

  private isValidCode(code: string): boolean {
    if (!code || typeof code !== 'string') {
      return false
    }
    // Must be exactly 6 digits
    const codeRegex = /^\d{6}$/
    return codeRegex.test(code)
  }
}