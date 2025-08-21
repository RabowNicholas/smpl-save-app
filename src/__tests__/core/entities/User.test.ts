import { describe, it, expect } from 'vitest'
import { User, createUser, validatePhoneNumber, updateUserTimestamp } from '@/core/entities/User'

describe('User Entity', () => {
  describe('createUser', () => {
    it('should create user with valid phone number', () => {
      const phone = '+1234567890'
      const user = createUser(phone)
      
      expect(user.phone).toBe(phone)
      expect(user.id).toBeDefined()
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    it('should generate unique IDs for different users', () => {
      const user1 = createUser('+1234567890')
      const user2 = createUser('+0987654321')
      
      expect(user1.id).not.toBe(user2.id)
    })

    it('should set createdAt and updatedAt to same time on creation', () => {
      const user = createUser('+1234567890')
      
      expect(user.createdAt.getTime()).toBe(user.updatedAt.getTime())
    })
  })

  describe('validatePhoneNumber', () => {
    it('should validate US phone number format', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true)
      expect(validatePhoneNumber('+12345678901')).toBe(true)
    })

    it('should reject invalid phone number formats', () => {
      expect(validatePhoneNumber('1234567890')).toBe(false)  // no +
      expect(validatePhoneNumber('+123')).toBe(false)        // too short
      expect(validatePhoneNumber('+123456789012345')).toBe(false) // too long
      expect(validatePhoneNumber('+abcdefghij')).toBe(false)  // non-numeric
      expect(validatePhoneNumber('')).toBe(false)            // empty
    })

    it('should handle international phone numbers', () => {
      expect(validatePhoneNumber('+447911123456')).toBe(true) // UK
      expect(validatePhoneNumber('+33123456789')).toBe(true)  // France
      expect(validatePhoneNumber('+81901234567')).toBe(true)  // Japan
    })
  })

  describe('updateUserTimestamp', () => {
    it('should update only updatedAt timestamp', async () => {
      const user = createUser('+1234567890')
      const originalCreatedAt = user.createdAt
      const originalUpdatedAt = user.updatedAt
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const updatedUser = updateUserTimestamp(user)
      
      expect(updatedUser.createdAt).toEqual(originalCreatedAt)
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })

    it('should not mutate original user object', () => {
      const user = createUser('+1234567890')
      const originalUpdatedAt = user.updatedAt
      
      updateUserTimestamp(user)
      
      expect(user.updatedAt).toEqual(originalUpdatedAt)
    })
  })
})