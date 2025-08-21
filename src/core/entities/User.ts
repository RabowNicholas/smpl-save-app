import { User } from '@/core/types'
import { randomUUID } from 'crypto'

export function createUser(phone: string): User {
  if (!validatePhoneNumber(phone)) {
    throw new Error('Invalid phone number format')
  }

  const now = new Date()
  
  return {
    id: randomUUID(),
    phone,
    createdAt: now,
    updatedAt: now,
  }
}

export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Must start with + and be between 10-14 digits (not 15)
  const phoneRegex = /^\+\d{10,14}$/
  return phoneRegex.test(phone)
}

export function updateUserTimestamp(user: User): User {
  return {
    ...user,
    updatedAt: new Date(),
  }
}