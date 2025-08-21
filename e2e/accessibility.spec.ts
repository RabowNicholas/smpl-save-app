import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in with your phone')
    
    // Navigate through auth flow to check other headings
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    const phoneInput = page.getByLabel('Phone number')
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Enter verification code')
  })

  test('should have proper form labels', async ({ page }) => {
    // Phone input should have proper label
    const phoneInput = page.getByLabel('Phone number')
    await expect(phoneInput).toBeVisible()
    await expect(phoneInput).toHaveAttribute('aria-required', 'true')
    
    // Navigate to code step
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    // Code input should have proper label
    const codeInput = page.getByLabel('Verification code')
    await expect(codeInput).toBeVisible()
    await expect(codeInput).toHaveAttribute('aria-required', 'true')
  })

  test('should have keyboard navigation support', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab')
    await expect(page.getByLabel('Phone number')).toBeFocused()
    
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Send verification code' })).toBeFocused()
    
    // Test form submission with Enter key
    await page.getByLabel('Phone number').fill('1234567890')
    
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await page.keyboard.press('Enter')
    
    await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible()
  })

  test('should announce errors to screen readers', async ({ page }) => {
    // Trigger validation error
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    const errorMessage = page.getByText('Please enter a valid phone number')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toHaveAttribute('role', 'alert')
  })

  test('should have proper ARIA attributes on interactive elements', async ({ page }) => {
    // Complete auth flow to reach service selection
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await page.route('**/api/auth/verify-code', async route => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ success: true, user: { id: '123', phone: '+11234567890' } }) 
      })
    })
    
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'streaming', name: 'Streaming & Entertainment', icon: '🎬', displayOrder: 1 },
        ])
      })
    })
    
    await page.route('**/api/services/streaming', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'netflix', name: 'Netflix', logoUrl: '/logos/netflix.png', categoryId: 'streaming', isFeatured: true },
        ])
      })
    })
    
    const phoneInput = page.getByLabel('Phone number')
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    const codeInput = page.getByLabel('Verification code')
    await codeInput.fill('123456')
    await page.getByRole('button', { name: 'Verify' }).click()
    
    await page.getByTestId('category-streaming').click()
    
    // Check service grid ARIA attributes
    const serviceGrid = page.getByRole('grid')
    await expect(serviceGrid).toBeVisible()
    await expect(serviceGrid).toHaveAttribute('aria-label', 'Service selection')
    
    // Check service cards
    const netflixCard = page.getByTestId('service-card-netflix')
    await expect(netflixCard).toHaveAttribute('role', 'gridcell')
    await expect(netflixCard).toHaveAttribute('aria-selected', 'false')
    await expect(netflixCard).toHaveAttribute('tabIndex', '0')
  })

  test('should support screen reader announcements for service selection', async ({ page }) => {
    // Complete auth flow to reach service selection
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await page.route('**/api/auth/verify-code', async route => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ success: true, user: { id: '123', phone: '+11234567890' } }) 
      })
    })
    
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'streaming', name: 'Streaming & Entertainment', icon: '🎬', displayOrder: 1 },
        ])
      })
    })
    
    await page.route('**/api/services/streaming', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'netflix', name: 'Netflix', logoUrl: '/logos/netflix.png', categoryId: 'streaming', isFeatured: true },
        ])
      })
    })
    
    await page.route('**/api/user/services', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) })
      }
    })
    
    const phoneInput = page.getByLabel('Phone number')
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    const codeInput = page.getByLabel('Verification code')
    await codeInput.fill('123456')
    await page.getByRole('button', { name: 'Verify' }).click()
    
    await page.getByTestId('category-streaming').click()
    
    // Check for screen reader announcement area
    const announcement = page.getByTestId('sr-announcement')
    await expect(announcement).toBeVisible()
    await expect(announcement).toHaveAttribute('aria-live', 'polite')
    
    // Select a service and check announcement
    await page.getByTestId('service-card-netflix').click()
    
    // Should announce the selection
    await expect(announcement).toHaveText('Netflix selected')
  })

  test('should have proper focus management', async ({ page }) => {
    // Navigate to code step
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    const phoneInput = page.getByLabel('Phone number')
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    // Code input should be auto-focused
    const codeInput = page.getByLabel('Verification code')
    await expect(codeInput).toBeFocused()
    
    // Navigate back and check phone input retains focus appropriately
    await page.getByRole('button', { name: 'Back' }).click()
    
    // Phone number should still be filled
    await expect(page.getByLabel('Phone number')).toHaveValue('(123) 456-7890')
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic test - in a real app you'd use tools like axe-core
    // Check that error messages are visually distinct
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    const errorMessage = page.getByText('Please enter a valid phone number')
    await expect(errorMessage).toBeVisible()
    
    // Error should be in red color (visually distinct)
    await expect(errorMessage).toHaveClass(/text-red-600/)
  })

  test('should work with keyboard-only navigation', async ({ page }) => {
    // Complete entire flow with keyboard only
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await page.route('**/api/auth/verify-code', async route => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ success: true, user: { id: '123', phone: '+11234567890' } }) 
      })
    })
    
    // Use keyboard to navigate and fill phone number
    await page.keyboard.press('Tab') // Focus phone input
    await page.keyboard.type('1234567890')
    await page.keyboard.press('Tab') // Focus submit button
    await page.keyboard.press('Enter') // Submit
    
    // Should navigate to code step
    await expect(page.getByRole('heading', { name: 'Enter verification code' })).toBeVisible()
    
    // Code input should be focused
    await expect(page.getByLabel('Verification code')).toBeFocused()
    
    // Type code and submit with keyboard
    await page.keyboard.type('123456')
    await page.keyboard.press('Enter')
    
    // Should complete auth flow
    await expect(page.getByText("Welcome! Let's set up your services")).toBeVisible()
  })
})