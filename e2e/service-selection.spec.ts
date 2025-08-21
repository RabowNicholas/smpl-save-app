import { test, expect } from '@playwright/test'

test.describe('Service Selection Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to service selection
    await page.goto('/')
    
    // Complete auth flow
    await page.route('**/api/auth/send-code', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
    })
    
    await page.route('**/api/auth/verify-code', async route => {
      await route.fulfill({ 
        status: 200, 
        body: JSON.stringify({ success: true, user: { id: '123', phone: '+11234567890' } }) 
      })
    })
    
    const phoneInput = page.getByLabel('Phone number')
    await phoneInput.fill('1234567890')
    await page.getByRole('button', { name: 'Send verification code' }).click()
    
    const codeInput = page.getByLabel('Verification code')
    await codeInput.fill('123456')
    await page.getByRole('button', { name: 'Verify' }).click()
    
    // Should now be on service selection page
    await expect(page.getByText("Welcome! Let's set up your services")).toBeVisible()
  })

  test('should display service categories', async ({ page }) => {
    // Mock categories API
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'streaming', name: 'Streaming & Entertainment', icon: '🎬', displayOrder: 1 },
          { id: 'groceries', name: 'Groceries', icon: '🛒', displayOrder: 2 },
          { id: 'internet', name: 'Internet / Phone', icon: '📡', displayOrder: 3 },
        ])
      })
    })
    
    await page.reload()
    
    await expect(page.getByText('🎬')).toBeVisible()
    await expect(page.getByText('Streaming & Entertainment')).toBeVisible()
    await expect(page.getByText('🛒')).toBeVisible()
    await expect(page.getByText('Groceries')).toBeVisible()
  })

  test('should navigate to specific category when clicked', async ({ page }) => {
    // Mock categories and services APIs
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
        ])
      })
    })
    
    await page.reload()
    
    // Click on streaming category
    await page.getByTestId('category-streaming').click()
    
    await expect(page.getByText('Select Streaming & Entertainment services')).toBeVisible()
    await expect(page.getByText('Netflix')).toBeVisible()
    await expect(page.getByText('Hulu')).toBeVisible()
  })

  test('should allow service selection and deselection', async ({ page }) => {
    // Setup category navigation
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
    
    await page.reload()
    await page.getByTestId('category-streaming').click()
    
    // Select Netflix
    const netflixCard = page.getByTestId('service-card-netflix')
    await netflixCard.click()
    
    // Should show selected state
    await expect(netflixCard).toHaveClass(/selected/)
    await expect(page.getByTestId('check-icon-netflix')).toBeVisible()
    
    // Deselect Netflix
    await netflixCard.click()
    await expect(netflixCard).not.toHaveClass(/selected/)
  })

  test('should show search functionality', async ({ page }) => {
    // Setup for service selection page
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
        ])
      })
    })
    
    await page.reload()
    await page.getByTestId('category-streaming').click()
    
    // Search for Netflix
    const searchInput = page.getByPlaceholder('Search services...')
    await searchInput.fill('Net')
    
    await expect(page.getByText('Netflix')).toBeVisible()
    await expect(page.getByText('Hulu')).not.toBeVisible()
    await expect(page.getByText('Disney+')).not.toBeVisible()
  })

  test('should show progress tracking', async ({ page }) => {
    // Mock progress API
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
    
    await expect(page.getByText('33%')).toBeVisible()
    await expect(page.getByText('1 of 3 categories completed')).toBeVisible()
    await expect(page.getByText('2 of 6 services selected')).toBeVisible()
  })

  test('should save selected services', async ({ page }) => {
    let savedServices: any[] = []
    
    // Setup category navigation
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
        const body = await route.request().postDataJSON()
        savedServices.push(body)
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      } else {
        await route.fulfill({ status: 200, body: JSON.stringify([]) })
      }
    })
    
    await page.reload()
    await page.getByTestId('category-streaming').click()
    
    // Select Netflix
    await page.getByTestId('service-card-netflix').click()
    
    // Should have saved the service
    expect(savedServices).toContainEqual(
      expect.objectContaining({ serviceId: 'netflix' })
    )
  })

  test('should handle navigation between categories', async ({ page }) => {
    // Mock multiple categories
    await page.route('**/api/categories', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'streaming', name: 'Streaming & Entertainment', icon: '🎬', displayOrder: 1 },
          { id: 'groceries', name: 'Groceries', icon: '🛒', displayOrder: 2 },
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
    
    await page.route('**/api/services/groceries', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 'walmart', name: 'Walmart', logoUrl: '/logos/walmart.png', categoryId: 'groceries', isFeatured: true },
        ])
      })
    })
    
    await page.reload()
    
    // Navigate to streaming
    await page.getByTestId('category-streaming').click()
    await expect(page.getByText('Netflix')).toBeVisible()
    
    // Navigate back to categories
    await page.getByRole('button', { name: 'Back to Categories' }).click()
    await expect(page.getByText('Streaming & Entertainment')).toBeVisible()
    
    // Navigate to groceries
    await page.getByTestId('category-groceries').click()
    await expect(page.getByText('Walmart')).toBeVisible()
  })
})