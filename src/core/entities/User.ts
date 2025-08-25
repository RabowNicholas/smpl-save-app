import { User } from '@/core/types'
import { randomUUID } from 'crypto'
import { generateSafeUserCode } from '@/core/utils/userCode'

export function createUser(phone: string): User {
  if (!validatePhoneNumber(phone)) {
    throw new Error('Invalid phone number format')
  }

  const now = new Date()
  
  return {
    id: randomUUID(),
    userCode: generateSafeUserCode(),
    phone,
    createdAt: now,
    updatedAt: now,
  }
}

export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Must start with + and be between 7-15 digits (E.164 format)
  const phoneRegex = /^\+\d{7,15}$/
  return phoneRegex.test(phone)
}

export function updateUserTimestamp(user: User): User {
  return {
    ...user,
    updatedAt: new Date(),
  }
}