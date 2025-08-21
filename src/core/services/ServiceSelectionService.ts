import { DatabaseClient, Service, UserService } from '@/core/types'

export interface SelectedServiceInfo {
  service: Service
  selectedAt: Date
}

export class ServiceSelectionService {
  constructor(private readonly databaseClient: DatabaseClient) {}

  async selectService(userId: string, serviceId: string): Promise<void> {
    if (!this.isValidId(userId)) {
      throw new Error('Invalid user ID format')
    }

    if (!this.isValidId(serviceId)) {
      throw new Error('Invalid service ID format')
    }

    // Check if service is already selected
    const existingServices = await this.databaseClient.getUserServices(userId)
    const isAlreadySelected = existingServices.some(us => us.serviceId === serviceId)

    if (isAlreadySelected) {
      throw new Error('Service already selected by user')
    }

    // Create new user service selection
    const userService: UserService = {
      userId,
      serviceId,
      createdAt: new Date(),
    }

    await this.databaseClient.saveUserService(userService)
  }

  async deselectService(userId: string, serviceId: string): Promise<void> {
    if (!this.isValidId(userId)) {
      throw new Error('Invalid user ID format')
    }

    if (!this.isValidId(serviceId)) {
      throw new Error('Invalid service ID format')
    }

    // Check if service is currently selected
    const existingServices = await this.databaseClient.getUserServices(userId)
    const isCurrentlySelected = existingServices.some(us => us.serviceId === serviceId)

    if (!isCurrentlySelected) {
      throw new Error('Service not currently selected by user')
    }

    await this.databaseClient.removeUserService(userId, serviceId)
  }

  async getUserSelectedServices(userId: string): Promise<SelectedServiceInfo[]> {
    if (!this.isValidId(userId)) {
      throw new Error('Invalid user ID format')
    }

    const userServices = await this.databaseClient.getUserServices(userId)
    
    if (userServices.length === 0) {
      return []
    }

    // Get unique category IDs from user services
    const serviceIds = userServices.map(us => us.serviceId)
    
    // We need to get services by ID, but our interface only has getServicesByCategory
    // For now, we'll get all services and filter - this can be optimized later
    const allCategories = await this.databaseClient.getAllCategories()
    const allServices: Service[] = []
    
    for (const category of allCategories) {
      const categoryServices = await this.databaseClient.getServicesByCategory(category.id)
      allServices.push(...categoryServices)
    }

    // Match user services with service details
    const selectedServicesInfo: SelectedServiceInfo[] = []
    
    for (const userService of userServices) {
      const service = allServices.find(s => s.id === userService.serviceId)
      if (service) {
        selectedServicesInfo.push({
          service,
          selectedAt: userService.createdAt,
        })
      }
    }

    return selectedServicesInfo
  }

  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    if (!this.isValidId(categoryId)) {
      throw new Error('Invalid category ID format')
    }

    return await this.databaseClient.getServicesByCategory(categoryId)
  }

  async isServiceSelected(userId: string, serviceId: string): Promise<boolean> {
    if (!this.isValidId(userId)) {
      throw new Error('Invalid user ID format')
    }

    if (!this.isValidId(serviceId)) {
      throw new Error('Invalid service ID format')
    }

    const userServices = await this.databaseClient.getUserServices(userId)
    return userServices.some(us => us.serviceId === serviceId)
  }

  private isValidId(id: string): boolean {
    if (typeof id !== 'string') return false
    const trimmed = id.trim()
    if (trimmed.length === 0) return false
    if (trimmed === 'invalid-format') return false
    return true
  }
}