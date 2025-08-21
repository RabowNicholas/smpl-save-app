import { DatabaseClient, Category, CategoryProgress, OverallProgress, ProgressStatus } from '@/core/types'

export class ProgressService {
  constructor(private readonly databaseClient: DatabaseClient) {}

  async getUserProgress(userId: string): Promise<CategoryProgress[]> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID')
    }

    const [categories, userServices] = await Promise.all([
      this.databaseClient.getAllCategories(),
      this.databaseClient.getUserServices(userId),
    ])

    const categoryProgressList: CategoryProgress[] = []

    // Get progress for each category
    for (const category of categories) {
      const categoryServices = await this.databaseClient.getServicesByCategory(category.id)
      
      // Find selected services in this category
      const selectedServiceIds = userServices
        .filter(us => categoryServices.some(s => s.id === us.serviceId))
        .map(us => us.serviceId)

      const selectedServices = categoryServices.filter(s => selectedServiceIds.includes(s.id))

      // Determine status
      let status: ProgressStatus
      if (categoryServices.length === 0) {
        status = 'completed' // No services means completed
      } else if (selectedServices.length === 0) {
        status = 'incomplete'
      } else if (selectedServices.length === categoryServices.length) {
        status = 'completed'
      } else {
        status = 'in-progress'
      }

      categoryProgressList.push({
        categoryId: category.id,
        status,
        selectedServices,
        totalServices: categoryServices.length,
      })
    }

    return categoryProgressList
  }

  async getOverallProgress(userId: string): Promise<OverallProgress> {
    const categoryProgressList = await this.getUserProgress(userId)

    const totalCategories = categoryProgressList.length
    const categoriesCompleted = categoryProgressList.filter(cp => cp.status === 'completed').length
    const totalServices = categoryProgressList.reduce((sum, cp) => sum + cp.totalServices, 0)
    const servicesSelected = categoryProgressList.reduce((sum, cp) => sum + cp.selectedServices.length, 0)

    const completionPercentage = totalServices === 0 ? 100 : (servicesSelected / totalServices) * 100

    return {
      completionPercentage,
      categoriesCompleted,
      totalCategories,
      servicesSelected,
      totalServices,
    }
  }

  async getNextIncompleteCategory(userId: string): Promise<Category | null> {
    const [categories, categoryProgressList] = await Promise.all([
      this.databaseClient.getAllCategories(),
      this.getUserProgress(userId),
    ])

    // Find first category that's not completed and has services
    for (const category of categories) {
      const progress = categoryProgressList.find(cp => cp.categoryId === category.id)
      if (progress && progress.status !== 'completed' && progress.totalServices > 0) {
        return category
      }
    }

    return null
  }

  async getCategoryProgress(userId: string, categoryId: string): Promise<CategoryProgress> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID')
    }

    if (!categoryId || typeof categoryId !== 'string') {
      throw new Error('Invalid category ID')
    }

    const [userServices, categoryServices] = await Promise.all([
      this.databaseClient.getUserServices(userId),
      this.databaseClient.getServicesByCategory(categoryId),
    ])

    // Find selected services in this category
    const selectedServiceIds = userServices
      .filter(us => categoryServices.some(s => s.id === us.serviceId))
      .map(us => us.serviceId)

    const selectedServices = categoryServices.filter(s => selectedServiceIds.includes(s.id))

    // Determine status
    let status: ProgressStatus
    if (categoryServices.length === 0) {
      status = 'completed' // No services means completed
    } else if (selectedServices.length === 0) {
      status = 'incomplete'
    } else if (selectedServices.length === categoryServices.length) {
      status = 'completed'
    } else {
      status = 'in-progress'
    }

    return {
      categoryId,
      status,
      selectedServices,
      totalServices: categoryServices.length,
    }
  }
}