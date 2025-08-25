/**
 * Utility functions for generating and validating 7-digit human-readable user codes
 * Format: XXX-XXXX (3 letters + 4 numbers)
 * Example: ABC-1234
 */

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // Excludes I, O to avoid confusion with 1, 0
const NUMBERS = '0123456789'

/**
 * Generate a random 7-digit user code in format ABC-1234
 */
export function generateUserCode(): string {
  // Generate 3 random letters
  const letters = Array.from({ length: 3 }, () => 
    LETTERS[Math.floor(Math.random() * LETTERS.length)]
  ).join('')
  
  // Generate 4 random numbers
  const numbers = Array.from({ length: 4 }, () => 
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
  ).join('')
  
  return `${letters}-${numbers}`
}

/**
 * Validate a user code format
 */
export function validateUserCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false
  }
  
  // Check format: 3 letters, hyphen, 4 numbers
  const codeRegex = /^[A-Z]{3}-[0-9]{4}$/
  return codeRegex.test(code.toUpperCase())
}

/**
 * Format a user code to ensure consistent display
 */
export function formatUserCode(code: string): string {
  if (!code) return ''
  
  // Remove any existing hyphens and spaces
  const cleaned = code.replace(/[-\s]/g, '').toUpperCase()
  
  if (cleaned.length !== 7) {
    return code // Return original if not expected length
  }
  
  // Insert hyphen after 3rd character
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
}

/**
 * Generate a batch of unique user codes
 * Useful for pre-generating codes to check uniqueness
 */
export function generateUserCodeBatch(count: number): string[] {
  const codes = new Set<string>()
  
  while (codes.size < count) {
    codes.add(generateUserCode())
  }
  
  return Array.from(codes)
}

/**
 * Check if a code conflicts with common words or patterns to avoid
 */
export function isOffensiveOrConfusing(code: string): boolean {
  const disallowed = [
    // Common curse words (first 3 letters)
    'ASS', 'SEX', 'FUK', 'SHT', 'DMN',
    // Confusing patterns
    '000', '111', '123', 'ABC'
  ]
  
  const letters = code.split('-')[0]
  const numbers = code.split('-')[1]
  
  return disallowed.includes(letters) || 
         numbers === '0000' || 
         numbers === '1111' ||
         numbers === '1234'
}

/**
 * Generate a safe user code that avoids offensive or confusing patterns
 */
export function generateSafeUserCode(): string {
  let code: string
  let attempts = 0
  const maxAttempts = 100
  
  do {
    code = generateUserCode()
    attempts++
  } while (isOffensiveOrConfusing(code) && attempts < maxAttempts)
  
  return code
}