import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProgressService } from '@/core/services/ProgressService'
import { DatabaseClient, Category, Service, UserService, CategoryProgress } from '@/core/types'

// Mock database client
const mockDatabaseClient: DatabaseClient = {
  saveUserService: vi.fn(),
  removeUserService: vi.fn(),
  getUserServices: vi.fn(),
  getServicesByCategory: vi.fn(),
  getAllCategories: vi.fn(),
}

const mockCategories: Category[] = [
  { id: 'streaming', name: 'Streaming', icon: '🎬', displayOrder: 1 },
  { id: 'groceries', name: 'Groceries', icon: '🛒', displayOrder: 2 },
  { id: 'internet', name: 'Internet', icon: '📡', displayOrder: 3 },
]

const mockStreamingServices: Service[] = [
  { id: 'netflix', name: 'Netflix', logoUrl: 'netflix.png', categoryId: 'streaming', isFeatured: true },
  { id: 'hulu', name: 'Hulu', logoUrl: 'hulu.png', categoryId: 'streaming', isFeatured: false },
]

const mockGroceryServices: Service[] = [
  { id: 'walmart', name: 'Walmart', logoUrl: 'walmart.png', categoryId: 'groceries', isFeatured: true },
]

const mockUserServices: UserService[] = [
  { userId: 'user-1', serviceId: 'netflix', createdAt: new Date() },
]

describe('ProgressService', () => {
  let progressService: ProgressService

  beforeEach(() => {
    vi.clearAllMocks()
    progressService = new ProgressService(mockDatabaseClient)
  })

  describe('getUserProgress', () => {
    it('should calculate progress for all categories', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories)
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue(mockUserServices)
      vi.mocked(mockDatabaseClient.getServicesByCategory)
        .mockResolvedValueOnce(mockStreamingServices) // streaming
        .mockResolvedValueOnce(mockGroceryServices)   // groceries
        .mockResolvedValueOnce([])                    // internet

      const result = await progressService.getUserProgress(userId)

      expect(result).toHaveLength(3)
      
      // Streaming category - 1 selected out of 2
      expect(result[0]).toEqual({
        categoryId: 'streaming',
        status: 'in-progress',
        selectedServices: [mockStreamingServices[0]], // Netflix
        totalServices: 2,
      })

      // Groceries category - 0 selected out of 1
      expect(result[1]).toEqual({
        categoryId: 'groceries',
        status: 'incomplete',
        selectedServices: [],
        totalServices: 1,
      })

      // Internet category - 0 selected out of 0
      expect(result[2]).toEqual({
        categoryId: 'internet',
        status: 'completed',
        selectedServices: [],
        totalServices: 0,
      })
    })

    it('should mark category as completed when all services selected', async () => {
      const userId = 'user-1'
      const allStreamingSelected: UserService[] = [
        { userId: 'user-1', serviceId: 'netflix', createdAt: new Date() },
        { userId: 'user-1', serviceId: 'hulu', createdAt: new Date() },
      ]

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue([mockCategories[0]]) // just streaming
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue(allStreamingSelected)
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue(mockStreamingServices)

      const result = await progressService.getUserProgress(userId)

      expect(result[0].status).toBe('completed')
      expect(result[0].selectedServices).toHaveLength(2)
    })

    it('should handle user with no selections', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories)
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.getServicesByCategory)
        .mockResolvedValue(mockStreamingServices)

      const result = await progressService.getUserProgress(userId)

      expect(result).toHaveLength(3)
      expect(result.every(category => category.status === 'incomplete')).toBe(true)
    })
  })

  describe('getOverallProgress', () => {
    it('should calculate overall completion percentage', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories)
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue(mockUserServices)
      vi.mocked(mockDatabaseClient.getServicesByCategory)
        .mockResolvedValueOnce(mockStreamingServices) // 2 services
        .mockResolvedValueOnce(mockGroceryServices)   // 1 service
        .mockResolvedValueOnce([])                    // 0 services

      const result = await progressService.getOverallProgress(userId)

      // 1 selected out of 3 total services = 33.33%
      expect(result.completionPercentage).toBeCloseTo(33.33, 2)
      expect(result.categoriesCompleted).toBe(1) // internet category (0/0)
      expect(result.totalCategories).toBe(3)
      expect(result.servicesSelected).toBe(1)
      expect(result.totalServices).toBe(3)
    })

    it('should return 100% when no services exist', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories)
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue([])

      const result = await progressService.getOverallProgress(userId)

      expect(result.completionPercentage).toBe(100)
      expect(result.categoriesCompleted).toBe(3)
      expect(result.totalCategories).toBe(3)
      expect(result.servicesSelected).toBe(0)
      expect(result.totalServices).toBe(0)
    })

    it('should handle 100% completion correctly', async () => {
      const userId = 'user-1'
      const allSelected: UserService[] = [
        { userId: 'user-1', serviceId: 'netflix', createdAt: new Date() },
        { userId: 'user-1', serviceId: 'hulu', createdAt: new Date() },
        { userId: 'user-1', serviceId: 'walmart', createdAt: new Date() },
      ]

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories.slice(0, 2)) // streaming + groceries
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue(allSelected)
      vi.mocked(mockDatabaseClient.getServicesByCategory)
        .mockResolvedValueOnce(mockStreamingServices)
        .mockResolvedValueOnce(mockGroceryServices)

      const result = await progressService.getOverallProgress(userId)

      expect(result.completionPercentage).toBe(100)
      expect(result.categoriesCompleted).toBe(2)
      expect(result.servicesSelected).toBe(3)
      expect(result.totalServices).toBe(3)
    })
  })

  describe('getNextIncompleteCategory', () => {
    it('should return first incomplete category', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories)
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue(mockStreamingServices)

      const result = await progressService.getNextIncompleteCategory(userId)

      expect(result).toEqual(mockCategories[0]) // streaming is first
    })

    it('should return null when all categories completed', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])

      const result = await progressService.getNextIncompleteCategory(userId)

      expect(result).toBeNull()
    })

    it('should skip categories with no services', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue(mockCategories)
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.getServicesByCategory)
        .mockResolvedValueOnce([])                    // streaming - no services
        .mockResolvedValueOnce(mockGroceryServices)   // groceries - has services

      const result = await progressService.getNextIncompleteCategory(userId)

      expect(result).toEqual(mockCategories[1]) // groceries
    })
  })

  describe('getCategoryProgress', () => {
    it('should return progress for specific category', async () => {
      const userId = 'user-1'
      const categoryId = 'streaming'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue(mockUserServices)
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue(mockStreamingServices)

      const result = await progressService.getCategoryProgress(userId, categoryId)

      expect(result).toEqual({
        categoryId: 'streaming',
        status: 'in-progress',
        selectedServices: [mockStreamingServices[0]], // Netflix
        totalServices: 2,
      })
    })

    it('should handle non-existent category', async () => {
      const userId = 'user-1'
      const categoryId = 'non-existent'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue([])

      const result = await progressService.getCategoryProgress(userId, categoryId)

      expect(result).toEqual({
        categoryId: 'non-existent',
        status: 'completed', // no services means completed
        selectedServices: [],
        totalServices: 0,
      })
    })
  })
})