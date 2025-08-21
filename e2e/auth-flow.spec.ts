import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display phone number input form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in with your phone' })).toBeVisible()
    await expect(page.getByLabel('Phone number')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send verification code' })).toBeVisible()
  })

  test('should format phone number as user types', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number')
    
    await phoneInput.fill('1234567890')
    await expect(phoneInput).toHaveValue('(123) 456-7890')
  })

  test('should show validation error for invalid phone number', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    
    await submitButton.click()
    await expect(page.getByText('Please enter a valid phone number')).toBeVisible()
  })

  test('should show loading state when submitting phone number', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number')
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    
    await phoneInput.fill('1234567890')
    
    // Mock the API call to delay response
    await page.route('**/api/auth/send-code', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await submitButton.click()
    
    // Check loading state
    await expect(page.getByTestId('loading-spinner')).toBeVisible()
    await expect(page.getByText('Sending...')).toBeVisible()
  })

  test('should navigate to verification code step after valid phone submission', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number')
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    
    // Mock successful API response
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await phoneInput.fill('1234567890')
    await submitButton.click()
    
    // Should navigate to code verification step
    await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible()
    await expect(page.getByText('We sent a code to (123) 456-7890')).toBeVisible()
    await expect(page.getByLabel('Verification code')).toBeVisible()
  })

  test('should handle phone number submission error', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number')
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    
    // Mock API error
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ 
        status: 400, 
        body: JSON.stringify({ error: 'Invalid phone number format' }) 
      })
    })
    
    await phoneInput.fill('1234567890')
    await submitButton.click()
    
    await expect(page.getByText('Invalid phone number format')).toBeVisible()
  })
})

test.describe('Verification Code Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Navigate to code verification step
    const phoneInput = page.getByLabel('Phone number')
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await phoneInput.fill('1234567890')
    await submitButton.click()
    
    await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible()
  })

  test('should only allow numeric input in verification code field', async ({ page }) => {
    const codeInput = page.getByLabel('Verification code')
    
    await codeInput.fill('abc123xyz')
    await expect(codeInput).toHaveValue('123')
  })

  test('should limit verification code to 6 digits', async ({ page }) => {
    const codeInput = page.getByLabel('Verification code')
    
    await codeInput.fill('12345678901')
    await expect(codeInput).toHaveValue('123456')
  })

  test('should show validation error for incomplete code', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Verify' })
    
    await submitButton.click()
    await expect(page.getByText('Please enter a 6-digit verification code')).toBeVisible()
  })

  test('should submit valid verification code', async ({ page }) => {
    const codeInput = page.getByLabel('Verification code')
    const submitButton = page.getByRole('button', { name: 'Verify' })
    
    // Mock successful verification
    await page.route('**/api/auth/verify-code', async route => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ success: true, user: { id: '123', phone: '+11234567890' } }) 
      })
    })
    
    await codeInput.fill('123456')
    await submitButton.click()
    
    // Should navigate to service selection or dashboard
    await expect(page.getByText("Welcome! Let's set up your services")).toBeVisible()
  })

  test('should handle verification code error', async ({ page }) => {
    const codeInput = page.getByLabel('Verification code')
    const submitButton = page.getByRole('button', { name: 'Verify' })
    
    // Mock verification error
    await page.route('**/api/auth/verify-code', async route => {
      await route.fulfill({ 
        status: 400, 
        body: JSON.stringify({ error: 'Invalid verification code' }) 
      })
    })
    
    await codeInput.fill('123456')
    await submitButton.click()
    
    await expect(page.getByText('Invalid verification code')).toBeVisible()
  })

  test('should navigate back to phone number step when back button is clicked', async ({ page }) => {
    const backButton = page.getByRole('button', { name: 'Back' })
    
    await backButton.click()
    
    await expect(page.getByRole('heading', { name: 'Sign in with your phone' })).toBeVisible()
    await expect(page.getByLabel('Phone number')).toHaveValue('(123) 456-7890') // Should preserve phone number
  })

  test('should auto-focus verification code input', async ({ page }) => {
    const codeInput = page.getByLabel('Verification code')
    
    await expect(codeInput).toBeFocused()
  })
})