import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display correctly on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
    
    // Auth page should be responsive
    await expect(page.getByRole('heading', { name: 'Sign in with your phone' })).toBeVisible()
    
    const phoneInput = page.getByLabel('Phone number')
    await expect(phoneInput).toBeVisible()
    
    // Button should be full width on mobile
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    await expect(submitButton).toBeVisible()
  })

  test('should display correctly on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad size
    
    await expect(page.getByRole('heading', { name: 'Sign in with your phone' })).toBeVisible()
    await expect(page.getByLabel('Phone number')).toBeVisible()
  })

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }) // Desktop size
    
    await expect(page.getByRole('heading', { name: 'Sign in with your phone' })).toBeVisible()
    await expect(page.getByLabel('Phone number')).toBeVisible()
  })

  test('should have touch-friendly targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Buttons should be at least 44px tall (iOS recommendation)
    const submitButton = page.getByRole('button', { name: 'Send verification code' })
    const buttonBox = await submitButton.boundingBox()
    
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
  })

  test('service grid should adapt to screen size', async ({ page }) => {
    // Mock data for service selection
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
          { id: 'hulu', name: 'Hulu', logoUrl: '/logos/hulu.png', categoryId: 'streaming', isFeatured: false },
          { id: 'disney', name: 'Disney+', logoUrl: '/logos/disney.png', categoryId: 'streaming', isFeatured: true },
          { id: 'prime', name: 'Prime Video', logoUrl: '/logos/prime.png', categoryId: 'streaming', isFeatured: true },
        ])
      })
    })
    
    // Complete auth flow
    const phoneInput = page.getByLabel('Phone number')
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    const codeInput = page.getByLabel('Verification code')
    await codeInput.fill('123456')
    await page.getByRole('button', { name: 'Verify' }).click()
    
    await page.getByTestId('category-streaming').click()
    
    // Test mobile (1 column)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(100) // Wait for resize
    
    const serviceCards = page.getByTestId(/service-card-/)
    await expect(serviceCards.first()).toBeVisible()
    
    // Test tablet (2-3 columns)
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(100)
    await expect(serviceCards.first()).toBeVisible()
    
    // Test desktop (4+ columns)
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(100)
    await expect(serviceCards.first()).toBeVisible()
  })

  test('progress tracker should be responsive', async ({ page }) => {
    // Mock progress data
    await page.route('**/api/user/progress', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          overallProgress: {
            completionPercentage: 33.33,
            categoriesCompleted: 1,
            totalCategories: 3,
            servicesSelected: 2,
            totalServices: 6
          },
          categoryProgress: [
            {
              categoryId: 'streaming',
              status: 'completed',
              selectedServices: [
                { id: 'netflix', name: 'Netflix', logoUrl: '/logos/netflix.png', categoryId: 'streaming', isFeatured: true }
              ],
              totalServices: 2
            }
          ]
        })
      })
    })
    
    await page.goto('/progress')
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('33%')).toBeVisible()
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('33%')).toBeVisible()
    
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByText('33%')).toBeVisible()
  })
})