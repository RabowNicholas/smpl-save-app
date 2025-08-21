import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseDatabaseClient } from '@/services/database/SupabaseDatabaseClient'
import { supabase } from '@/services/database/supabase'

// Mock Supabase client
vi.mock('@/services/database/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signInWithOAuth: vi.fn(),
    },
  },
}))

const mockSupabase = vi.mocked(supabase)

describe('SupabaseDatabaseClient', () => {
  let client: SupabaseDatabaseClient
  
  const mockUserService = {
    id: 'us-1',
    user_id: 'user-1',
    service_id: 'service-1',
    created_at: '2024-01-01T00:00:00.000Z',
  }

  const mockService = {
    id: 'service-1',
    name: 'Netflix',
    logo_url: 'https://example.com/netflix.png',
    category_id: 'streaming',
    is_featured: true,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  }

  const mockCategory = {
    id: 'streaming',
    name: 'Streaming',
    icon: '🎬',
    display_order: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    client = new SupabaseDatabaseClient()
  })

  describe('saveUserService', () => {
    it('should save user service selection', async () => {
      const userService = {
        userId: 'user-1',
        serviceId: 'service-1',
        createdAt: new Date(),
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [mockUserService], error: null }),
      })

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await client.saveUserService(userService)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_services')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: userService.userId,
        service_id: userService.serviceId,
        created_at: userService.createdAt.toISOString(),
      })
    })

    it('should handle database errors', async () => {
      const userService = {
        userId: 'user-1',
        serviceId: 'service-1',
        createdAt: new Date(),
      }

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Duplicate key violation' } 
        }),
      })

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await expect(client.saveUserService(userService))
        .rejects.toThrow('Failed to save user service: Duplicate key violation')
    })
  })

  describe('removeUserService', () => {
    it('should remove user service selection', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      })

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      })

      await client.removeUserService(userId, serviceId)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_services')
    })

    it('should handle removal errors', async () => {
      const userId = 'user-1'
      const serviceId = 'service-1'

      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'No rows deleted' } 
          })
        })
      })

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      })

      await expect(client.removeUserService(userId, serviceId))
        .rejects.toThrow('Failed to remove user service: No rows deleted')
    })
  })

  describe('getUserServices', () => {
    it('should return user services', async () => {
      const userId = 'user-1'

      const mockEq = vi.fn().mockResolvedValue({ 
        data: [mockUserService], 
        error: null 
      })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await client.getUserServices(userId)

      expect(mockSupabase.from).toHaveBeenCalledWith('user_services')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        userId: mockUserService.user_id,
        serviceId: mockUserService.service_id,
        createdAt: new Date(mockUserService.created_at),
      })
    })

    it('should return empty array when no services found', async () => {
      const userId = 'user-1'

      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await client.getUserServices(userId)

      expect(result).toEqual([])
    })
  })

  describe('getServicesByCategory', () => {
    it('should return services filtered by category', async () => {
      const categoryId = 'streaming'

      const mockEq = vi.fn().mockResolvedValue({ 
        data: [mockService], 
        error: null 
      })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await client.getServicesByCategory(categoryId)

      expect(mockSupabase.from).toHaveBeenCalledWith('services')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: mockService.id,
        name: mockService.name,
        logoUrl: mockService.logo_url,
        categoryId: mockService.category_id,
        isFeatured: mockService.is_featured,
      })
    })

    it('should handle category not found', async () => {
      const categoryId = 'non-existent'

      const mockEq = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await client.getServicesByCategory(categoryId)

      expect(result).toEqual([])
    })
  })

  describe('getAllCategories', () => {
    it('should return all categories ordered by display_order', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ 
        data: [mockCategory], 
        error: null 
      })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await client.getAllCategories()

      expect(mockSupabase.from).toHaveBeenCalledWith('categories')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: mockCategory.id,
        name: mockCategory.name,
        icon: mockCategory.icon,
        displayOrder: mockCategory.display_order,
      })
    })

    it('should handle empty categories', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await client.getAllCategories()

      expect(result).toEqual([])
    })

    it('should handle database errors', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Connection failed' } 
      })
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      })

      await expect(client.getAllCategories())
        .rejects.toThrow('Failed to fetch categories: Connection failed')
    })
  })
})