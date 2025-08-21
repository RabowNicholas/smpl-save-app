import { describe, it, expect } from 'vitest'
import { Service, createService, validateServiceData, updateServiceData } from '@/core/entities/Service'

describe('Service Entity', () => {
  describe('createService', () => {
    it('should create service with required fields', () => {
      const serviceData = {
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      }
      
      const service = createService(serviceData)
      
      expect(service.id).toBeDefined()
      expect(service.name).toBe('Netflix')
      expect(service.logoUrl).toBe('https://example.com/netflix.png')
      expect(service.categoryId).toBe('streaming')
      expect(service.isFeatured).toBe(false) // default
    })

    it('should create service with featured flag', () => {
      const serviceData = {
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming',
        isFeatured: true
      }
      
      const service = createService(serviceData)
      
      expect(service.isFeatured).toBe(true)
    })

    it('should generate unique IDs for different services', () => {
      const data = {
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      }
      
      const service1 = createService(data)
      const service2 = createService({ ...data, name: 'Hulu' })
      
      expect(service1.id).not.toBe(service2.id)
    })

    it('should throw error for invalid service data', () => {
      expect(() => {
        createService({
          name: '',
          logoUrl: 'https://example.com/netflix.png',
          categoryId: 'streaming'
        })
      }).toThrow('Invalid service data')
    })
  })

  describe('validateServiceData', () => {
    it('should validate complete service data', () => {
      const validData = {
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming',
        isFeatured: false
      }
      
      expect(validateServiceData(validData)).toBe(true)
    })

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      }
      
      expect(validateServiceData(invalidData)).toBe(false)
    })

    it('should reject invalid logo URL', () => {
      const invalidData = {
        name: 'Netflix',
        logoUrl: 'not-a-url',
        categoryId: 'streaming'
      }
      
      expect(validateServiceData(invalidData)).toBe(false)
    })

    it('should reject empty category ID', () => {
      const invalidData = {
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: ''
      }
      
      expect(validateServiceData(invalidData)).toBe(false)
    })

    it('should accept optional isFeatured field', () => {
      const validData = {
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      }
      
      expect(validateServiceData(validData)).toBe(true)
    })
  })

  describe('updateServiceData', () => {
    it('should update service name', () => {
      const originalService = createService({
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      })

      const updatedService = updateServiceData(originalService, { name: 'Netflix HD' })
      
      expect(updatedService.name).toBe('Netflix HD')
      expect(updatedService.id).toBe(originalService.id)
      expect(updatedService.logoUrl).toBe(originalService.logoUrl)
    })

    it('should update featured status', () => {
      const originalService = createService({
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      })

      const updatedService = updateServiceData(originalService, { isFeatured: true })
      
      expect(updatedService.isFeatured).toBe(true)
      expect(updatedService.name).toBe(originalService.name)
    })

    it('should not mutate original service', () => {
      const originalService = createService({
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      })
      const originalName = originalService.name

      updateServiceData(originalService, { name: 'Netflix HD' })
      
      expect(originalService.name).toBe(originalName)
    })

    it('should validate update data', () => {
      const service = createService({
        name: 'Netflix',
        logoUrl: 'https://example.com/netflix.png',
        categoryId: 'streaming'
      })

      expect(() => {
        updateServiceData(service, { name: '' })
      }).toThrow('Invalid update data')
    })
  })
})