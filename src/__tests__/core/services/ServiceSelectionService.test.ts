import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServiceSelectionService } from '@/core/services/ServiceSelectionService'
import { DatabaseClient, Service, UserService } from '@/core/types'

// Mock database client
const mockDatabaseClient: DatabaseClient = {
  saveUserService: vi.fn(),
  removeUserService: vi.fn(),
  getUserServices: vi.fn(),
  getServicesByCategory: vi.fn(),
  getAllCategories: vi.fn(),
}

const mockService: Service = {
  id: 'service-1',
  name: 'Netflix',
  logoUrl: 'https://example.com/netflix.png',
  categoryId: 'streaming',
  isFeatured: true,
}

const mockUserService: UserService = {
  userId: 'user-1',
  serviceId: 'service-1',
  createdAt: new Date(),
}

describe('ServiceSelectionService', () => {
  let service: ServiceSelectionService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ServiceSelectionService(mockDatabaseClient)
  })

  describe('selectService', () => {
    it('should save user service selection', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])
      vi.mocked(mockDatabaseClient.saveUserService).mockResolvedValue(undefined)

      await service.selectService(userId, serviceId)

      expect(mockDatabaseClient.saveUserService).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          serviceId,
          createdAt: expect.any(Date),
        })
      )
    })

    it('should not save duplicate service selection', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      // Mock that user already has this service
      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])

      await expect(service.selectService(userId, serviceId))
        .rejects.toThrow('Service already selected by user')

      expect(mockDatabaseClient.saveUserService).not.toHaveBeenCalled()
    })

    it('should validate user ID format', async () => {
      const invalidUserIds = ['', '  ', 'invalid-format']

      for (const userId of invalidUserIds) {
        await expect(service.selectService(userId, 'service-1'))
          .rejects.toThrow('Invalid user ID format')
      }
    })

    it('should validate service ID format', async () => {
      const invalidServiceIds = ['', '  ', 'invalid-format']

      for (const serviceId of invalidServiceIds) {
        await expect(service.selectService('user-1', serviceId))
          .rejects.toThrow('Invalid service ID format')
      }
    })
  })

  describe('deselectService', () => {
    it('should remove user service selection', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])
      vi.mocked(mockDatabaseClient.removeUserService).mockResolvedValue(undefined)

      await service.deselectService(userId, serviceId)

      expect(mockDatabaseClient.removeUserService).toHaveBeenCalledWith(userId, serviceId)
    })

    it('should handle deselecting non-selected service gracefully', async () => {
      const userId = 'user-1'
      const serviceId = 'service-2' // different service

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])
      vi.mocked(mockDatabaseClient.removeUserService).mockResolvedValue(undefined)

      await expect(service.deselectService(userId, serviceId))
        .rejects.toThrow('Service not currently selected by user')
    })
  })

  describe('getUserSelectedServices', () => {
    it('should return user selected services with service details', async () => {
      const userId = 'user-1'
      const mockCategory = { id: 'streaming', name: 'Streaming', icon: '🎬', displayOrder: 1 }

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])
      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue([mockCategory])
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue([mockService])

      const result = await service.getUserSelectedServices(userId)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        service: mockService,
        selectedAt: mockUserService.createdAt,
      })
    })

    it('should return empty array for user with no selections', async () => {
      const userId = 'user-1'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])

      const result = await service.getUserSelectedServices(userId)

      expect(result).toEqual([])
    })

    it('should filter out services that no longer exist', async () => {
      const userId = 'user-1'
      const mockCategory = { id: 'streaming', name: 'Streaming', icon: '🎬', displayOrder: 1 }

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])
      vi.mocked(mockDatabaseClient.getAllCategories).mockResolvedValue([mockCategory])
      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue([]) // service no longer exists

      const result = await service.getUserSelectedServices(userId)

      expect(result).toEqual([])
    })
  })

  describe('getServicesByCategory', () => {
    it('should return services filtered by category', async () => {
      const categoryId = 'streaming'

      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue([mockService])

      const result = await service.getServicesByCategory(categoryId)

      expect(result).toEqual([mockService])
      expect(mockDatabaseClient.getServicesByCategory).toHaveBeenCalledWith(categoryId)
    })

    it('should return empty array for category with no services', async () => {
      const categoryId = 'empty-category'

      vi.mocked(mockDatabaseClient.getServicesByCategory).mockResolvedValue([])

      const result = await service.getServicesByCategory(categoryId)

      expect(result).toEqual([])
    })
  })

  describe('isServiceSelected', () => {
    it('should return true for selected service', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])

      const result = await service.isServiceSelected(userId, serviceId)

      expect(result).toBe(true)
    })

    it('should return false for unselected service', async () => {
      const userId = 'user-1'
      const serviceId = 'service-2'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([mockUserService])

      const result = await service.isServiceSelected(userId, serviceId)

      expect(result).toBe(false)
    })

    it('should return false when user has no selections', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      vi.mocked(mockDatabaseClient.getUserServices).mockResolvedValue([])

      const result = await service.isServiceSelected(userId, serviceId)

      expect(result).toBe(false)
    })
  })
})